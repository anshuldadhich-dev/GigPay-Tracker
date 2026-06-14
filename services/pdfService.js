const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function getLogoDataUri() {
  const requestedLogoPath = path.join(__dirname, '..', 'assets', 'logo.png');
  const fallbackLogoPath = path.join(__dirname, '..', 'assets', 'GigLogo.png');
  const logoPath = fs.existsSync(requestedLogoPath) ? requestedLogoPath : fallbackLogoPath;
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = logoBuffer.toString('base64');

  return `data:image/png;base64,${logoBase64}`;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getNumber(value) {
  const number = Number(String(value || '').replace(/[^0-9.-]/g, ''));

  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
  return `Rs. ${getNumber(value).toFixed(2)}`;
}

function getRideAmountValue(job) {
  if (job && job.rawAmount !== undefined && job.rawAmount !== null) {
    return getNumber(job.rawAmount);
  }

  return getNumber(job ? job.amount : 0);
}

function buildPlatformRows(platformSummary) {
  const requiredPlatforms = ['Uber', 'Ola', 'Rapido', 'Others'];
  const platformMap = new Map();

  platformSummary.forEach((row) => {
    const platform = row.platform || 'Others';
    const key = requiredPlatforms.includes(platform) ? platform : 'Others';
    const existing = platformMap.get(key) || {
      platform: key,
      totalRides: 0,
      totalEarnings: 0,
    };

    platformMap.set(key, {
      platform: key,
      totalRides: existing.totalRides + getNumber(row.totalRides),
      totalEarnings: existing.totalEarnings + getNumber(row.totalEarnings),
    });
  });

  return requiredPlatforms.map((platform) => (
    platformMap.get(platform) || {
      platform,
      totalRides: 0,
      totalEarnings: 0,
    }
  ));
}

const PLATFORM_COLORS = {
  Uber:   { bg: '#18181B', bar: '#18181B', light: '#F4F4F5', text: '#FFFFFF' },
  Ola:    { bg: '#16A34A', bar: '#16A34A', light: '#F0FDF4', text: '#FFFFFF' },
  Rapido: { bg: '#D97706', bar: '#D97706', light: '#FFFBEB', text: '#FFFFFF' },
  Others: { bg: '#64748B', bar: '#64748B', light: '#F8FAFC', text: '#FFFFFF' },
};

function getPlatformColor(platform) {
  return PLATFORM_COLORS[platform] || PLATFORM_COLORS.Others;
}

function buildPDFTemplate(data = {}) {
  const logoDataUri = getLogoDataUri();
  const jobs = data.jobs || [];
  const monthlySummary = data.monthlySummary || {};
  const platformSummary = data.platformSummary || [];
  const reportDate = new Date();
  const reportTimestamp = reportDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const reportId = `GIG-${reportDate.getFullYear()}${String(reportDate.getMonth() + 1).padStart(2, '0')}${String(reportDate.getDate()).padStart(2, '0')}-${String(reportDate.getTime()).slice(-6)}`;
  const grossIncome = getNumber(monthlySummary.grossIncome || data.totalEarnings);
  const estimatedTax = getNumber(monthlySummary.tax || grossIncome * 0.05);
  const netIncome = getNumber(monthlySummary.netIncome || grossIncome - estimatedTax);
  const totalJobs = getNumber(monthlySummary.totalRides || data.totalJobs || jobs.length);
  const averageEarnings = totalJobs > 0 ? grossIncome / totalJobs : 0;
  const reportPeriod = data.dateRange || `${monthlySummary.month || 'N/A'}/${monthlySummary.year || 'N/A'}`;
  const topRide = jobs.reduce((highest, job) => {
    if (!highest) return job;

    return getRideAmountValue(job) > getRideAmountValue(highest) ? job : highest;
  }, null);
  const topRideAmount = topRide ? topRide.amount || formatCurrency(getRideAmountValue(topRide)) : formatCurrency(0);
  const isPositive = grossIncome > 0;
  const rideRows = jobs.map((job) => ({ ...job, isTopRide: topRide && job === topRide }));
  const platformRows = buildPlatformRows(platformSummary);

  const platformMiniCards = platformRows.map((row) => {
    const c = getPlatformColor(row.platform);
    const earnings = getNumber(row.totalEarnings);
    const share = grossIncome > 0 ? (earnings / grossIncome) * 100 : 0;
    const hasActivity = row.totalRides > 0;

    return `
      <div class="pcard ${hasActivity ? '' : 'pcard-inactive'}">
        <div class="pcard-header">
          <span class="pdot" style="background:${c.bg}"></span>
          <span class="pcard-name">${escapeHTML(row.platform)}</span>
        </div>
        <div class="pcard-amount" style="color:${hasActivity ? c.bg : '#94A3B8'}">${escapeHTML(formatCurrency(earnings))}</div>
        <div class="pcard-rides">${escapeHTML(String(row.totalRides))} ride${row.totalRides !== 1 ? 's' : ''}</div>
        <div class="pcard-track">
          <div class="pcard-fill" style="width:${Math.min(share, 100).toFixed(1)}%;background:${c.bar};"></div>
        </div>
        <div class="pcard-pct">${share.toFixed(1)}%</div>
      </div>
    `;
  }).join('');

  const platformTableRows = platformRows.map((row) => {
    const c = getPlatformColor(row.platform);
    const earnings = getNumber(row.totalEarnings);
    const share = grossIncome > 0 ? (earnings / grossIncome) * 100 : 0;

    return `
      <tr>
        <td>
          <span class="ptag" style="background:${c.bg};color:${c.text}">${escapeHTML(row.platform)}</span>
        </td>
        <td class="num-cell">${escapeHTML(String(row.totalRides || 0))}</td>
        <td class="amt-cell">${escapeHTML(formatCurrency(earnings))}</td>
        <td class="share-cell">
          <div class="share-row">
            <span class="share-pct">${share.toFixed(1)}%</span>
            <div class="share-track">
              <div class="share-fill" style="width:${Math.min(share, 100).toFixed(1)}%;background:${c.bar};"></div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const rideHistoryRows = rideRows.map((job) => {
    const platform = job.client || 'Others';
    const c = getPlatformColor(platform);
    const isCompleted = String(job.status || '').toLowerCase() === 'completed';

    return `
      <tr class="${job.isTopRide ? 'top-row' : ''}">
        <td><span class="ptag small" style="background:${c.bg};color:${c.text}">${escapeHTML(platform)}</span></td>
        <td>${escapeHTML(job.title || 'N/A')}${job.isTopRide ? ' <span class="star-chip">&#9733; Top</span>' : ''}</td>
        <td>${escapeHTML(job.date || 'N/A')}</td>
        <td class="amt-cell">${escapeHTML(job.amount || formatCurrency(0))}</td>
        <td><span class="${isCompleted ? 'done-badge' : 'generic-badge'}">${escapeHTML(job.status || 'N/A')}</span></td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>GigPay Tracker Report</title>
        <style>
          @page {
            size: A4;
            margin: 14mm 14mm 20mm;
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #0F172A;
            background: #FFFFFF;
            font-size: 11.5px;
            line-height: 1.5;
          }

          /* ── HEADER ── */
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 16px;
            margin-bottom: 18px;
            border-bottom: 2px solid #E2E8F0;
            position: relative;
          }

          .header-accent {
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 72px;
            height: 2px;
            background: #2563EB;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .logo { width: 88px; height: auto; }

          .brand-name {
            font-size: 20px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: -0.3px;
          }

          .brand-sub {
            font-size: 10px;
            font-weight: 700;
            color: #2563EB;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-top: 2px;
          }

          .meta {
            text-align: right;
            font-size: 9.5px;
            color: #64748B;
            line-height: 1.8;
          }

          .period-pill {
            display: inline-block;
            background: #EFF6FF;
            color: #1D4ED8;
            font-weight: 800;
            font-size: 11px;
            padding: 4px 14px;
            border-radius: 20px;
            margin-bottom: 5px;
          }

          /* ── STAT CARDS ── */
          .stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 16px;
          }

          .stat-card {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 13px 12px 12px;
            position: relative;
            overflow: hidden;
          }

          .stat-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            border-radius: 10px 10px 0 0;
          }

          .sc-earnings::after { background: #2563EB; }
          .sc-jobs::after     { background: #7C3AED; }
          .sc-avg::after      { background: #0891B2; }
          .sc-period::after   { background: #D97706; }

          .stat-label {
            font-size: 8.5px;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            font-weight: 700;
            color: #94A3B8;
            margin-bottom: 7px;
            margin-top: 4px;
          }

          .stat-value {
            font-size: 17px;
            font-weight: 800;
            color: #0F172A;
            line-height: 1.2;
          }

          /* ── OVERVIEW ── */
          .overview-grid {
            display: grid;
            grid-template-columns: 1.35fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }

          .panel {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 14px;
            page-break-inside: avoid;
          }

          .sec-heading {
            font-size: 12px;
            font-weight: 800;
            color: #0F172A;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #F1F5F9;
            letter-spacing: -0.1px;
          }

          .kpi-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }

          .kpi {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 10px;
          }

          .kpi-label {
            font-size: 8.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
            color: #94A3B8;
            margin-bottom: 5px;
          }

          .kpi-value {
            font-size: 14px;
            font-weight: 800;
            color: #0F172A;
          }

          .kpi-value.v-tax { color: #DC2626; }
          .kpi-value.v-net { color: #16A34A; }

          .trend-tag {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-size: 9.5px;
            font-weight: 700;
            padding: 5px 10px;
            border-radius: 20px;
          }

          .trend-pos { color: #15803D; background: #F0FDF4; border: 1px solid #BBF7D0; }
          .trend-neu { color: #475569; background: #F1F5F9; border: 1px solid #CBD5E1; }

          /* Top Ride */
          .top-panel {
            background: #FFFBF5;
            border: 1px solid #FDE68A;
            border-left: 4px solid #F97316;
            border-radius: 10px;
            padding: 14px;
          }

          .top-eyebrow {
            font-size: 8.5px;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            font-weight: 700;
            color: #F97316;
            background: #FED7AA;
            display: inline-block;
            padding: 3px 8px;
            border-radius: 20px;
            margin-bottom: 8px;
          }

          .top-heading {
            font-size: 12px;
            font-weight: 800;
            color: #0F172A;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #FDE68A;
          }

          .top-amount {
            font-size: 26px;
            font-weight: 800;
            color: #EA580C;
            line-height: 1.1;
            margin-bottom: 6px;
          }

          .top-detail {
            font-size: 10px;
            color: #92400E;
            line-height: 1.6;
          }

          /* ── PLATFORM MINI CARDS ── */
          .platform-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 10px;
          }

          .pcard {
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            padding: 11px 10px;
            background: #FFFFFF;
          }

          .pcard-inactive { opacity: 0.55; }

          .pcard-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
          }

          .pdot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            display: inline-block;
            flex-shrink: 0;
          }

          .pcard-name {
            font-size: 10px;
            font-weight: 700;
            color: #0F172A;
          }

          .pcard-amount {
            font-size: 14px;
            font-weight: 800;
            margin-bottom: 2px;
          }

          .pcard-rides {
            font-size: 8.5px;
            color: #64748B;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 8px;
          }

          .pcard-track {
            height: 5px;
            background: #F1F5F9;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 4px;
          }

          .pcard-fill {
            height: 100%;
            border-radius: 4px;
          }

          .pcard-pct {
            font-size: 9px;
            font-weight: 700;
            color: #64748B;
          }

          /* ── TABLES ── */
          .section { margin-bottom: 16px; page-break-inside: avoid; }

          table {
            width: 100%;
            border-collapse: collapse;
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 10px;
            overflow: hidden;
            table-layout: fixed;
          }

          th {
            background: #1E293B;
            color: #FFFFFF;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            font-size: 8.5px;
            padding: 9px 11px;
            text-align: left;
          }

          td {
            padding: 9px 11px;
            border-bottom: 1px solid #F1F5F9;
            font-size: 10.5px;
            vertical-align: middle;
            word-break: break-word;
          }

          tbody tr:last-child td { border-bottom: none; }
          tbody tr:nth-child(even) td { background: #FAFAFA; }
          .top-row td { background: #FFFBEB !important; }

          .num-cell { text-align: right; }
          .amt-cell { text-align: right; font-weight: 700; white-space: nowrap; }

          .ptag {
            display: inline-block;
            padding: 3px 9px;
            border-radius: 6px;
            font-size: 9.5px;
            font-weight: 700;
          }

          .ptag.small { font-size: 8.5px; padding: 2px 7px; }

          .share-cell { min-width: 100px; }

          .share-row {
            display: flex;
            align-items: center;
            gap: 7px;
          }

          .share-pct {
            font-size: 10px;
            font-weight: 700;
            color: #0F172A;
            min-width: 34px;
          }

          .share-track {
            flex: 1;
            height: 6px;
            background: #F1F5F9;
            border-radius: 4px;
            overflow: hidden;
          }

          .share-fill {
            height: 100%;
            border-radius: 4px;
          }

          .done-badge {
            display: inline-block;
            background: #DCFCE7;
            color: #15803D;
            font-size: 8.5px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            white-space: nowrap;
          }

          .generic-badge {
            display: inline-block;
            background: #F1F5F9;
            color: #475569;
            font-size: 8.5px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            white-space: nowrap;
          }

          .star-chip {
            display: inline-block;
            font-size: 8px;
            font-weight: 700;
            color: #D97706;
            background: #FEF3C7;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 4px;
            vertical-align: middle;
          }

          /* ── FOOTER ── */
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #E2E8F0;
            font-size: 9px;
            color: #94A3B8;
          }

          @media print {
            .section, .panel, .stat-card { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <header class="header">
          <div class="brand">
            <img class="logo" src="${logoDataUri}" alt="GigPay Tracker" />
            <div>
              <div class="brand-name">GigPay Tracker Report</div>
              <div class="brand-sub">Monthly Earnings Report</div>
            </div>
          </div>
          <div class="meta">
            <div class="period-pill">${escapeHTML(reportPeriod)}</div>
            <div>Generated: ${escapeHTML(reportTimestamp)}</div>
            <div>Report ID: ${escapeHTML(reportId)}</div>
          </div>
          <div class="header-accent"></div>
        </header>

        <div class="stats-row">
          <div class="stat-card sc-earnings">
            <div class="stat-label">Total Earnings</div>
            <div class="stat-value">${escapeHTML(formatCurrency(grossIncome))}</div>
          </div>
          <div class="stat-card sc-jobs">
            <div class="stat-label">Total Rides</div>
            <div class="stat-value">${escapeHTML(String(totalJobs))}</div>
          </div>
          <div class="stat-card sc-avg">
            <div class="stat-label">Avg. per Ride</div>
            <div class="stat-value">${escapeHTML(formatCurrency(averageEarnings))}</div>
          </div>
          <div class="stat-card sc-period">
            <div class="stat-label">Report Period</div>
            <div class="stat-value">${escapeHTML(reportPeriod)}</div>
          </div>
        </div>

        <div class="overview-grid">
          <div class="panel">
            <div class="sec-heading">Financial Overview</div>
            <div class="kpi-row">
              <div class="kpi">
                <div class="kpi-label">Gross Income</div>
                <div class="kpi-value">${escapeHTML(formatCurrency(grossIncome))}</div>
              </div>
              <div class="kpi">
                <div class="kpi-label">Estimated Tax (5%)</div>
                <div class="kpi-value v-tax">${escapeHTML(formatCurrency(estimatedTax))}</div>
              </div>
              <div class="kpi">
                <div class="kpi-label">Net Income</div>
                <div class="kpi-value v-net">${escapeHTML(formatCurrency(netIncome))}</div>
              </div>
            </div>
            <span class="trend-tag ${isPositive ? 'trend-pos' : 'trend-neu'}">
              ${isPositive ? '&#8593;' : '&#8594;'}&nbsp;${isPositive ? 'Positive earnings activity' : 'No earnings recorded'}
            </span>
          </div>

          <div class="top-panel">
            <div class="top-eyebrow">&#9733; Top Earning Ride</div>
            <div class="top-heading">Best Performance</div>
            <div class="top-amount">${escapeHTML(topRideAmount)}</div>
            <div class="top-detail">
              ${topRide
                ? `${escapeHTML(topRide.title || 'Ride')}<br>${escapeHTML(topRide.client || 'Unknown')}&nbsp;&bull;&nbsp;${escapeHTML(topRide.date || 'N/A')}`
                : 'No rides for this period.'}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="sec-heading" style="margin-bottom:10px;">Platform Breakdown</div>
          <div class="platform-cards">
            ${platformMiniCards}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:22%">Platform</th>
                <th class="num-cell" style="width:16%">Rides</th>
                <th class="amt-cell" style="width:24%">Earnings</th>
                <th style="width:38%">Share</th>
              </tr>
            </thead>
            <tbody>${platformTableRows}</tbody>
          </table>
        </div>

        <div class="section">
          <div class="sec-heading" style="margin-bottom:10px;">Ride History</div>
          <table>
            <thead>
              <tr>
                <th style="width:18%">Platform</th>
                <th style="width:32%">Ride</th>
                <th style="width:17%">Date</th>
                <th class="amt-cell" style="width:17%">Amount</th>
                <th style="width:16%">Status</th>
              </tr>
            </thead>
            <tbody>${rideHistoryRows}</tbody>
          </table>
        </div>

        <footer class="footer">
          <span>Generated by GigPay Tracker</span>
          <span>Report ID: ${escapeHTML(reportId)}</span>
          <span>${escapeHTML(reportTimestamp)}</span>
        </footer>
      </body>
    </html>
  `;
}

async function generatePDF(data = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ],
  });
  try {
    const page = await browser.newPage();
    const html = buildPDFTemplate(data);

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="width:100%;font-size:8px;color:#64748B;padding:0 14mm;text-align:right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      printBackground: true,
      margin: {
        top: '18mm',
        right: '14mm',
        bottom: '20mm',
        left: '14mm',
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = {
  generatePDF,
};
