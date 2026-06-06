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
  const trendLabel = data.trendLabel || (grossIncome > 0 ? 'Positive earnings activity' : 'No earnings recorded');
  const trendSymbol = grossIncome > 0 ? '&#8593;' : '&#8594;';
  const rideRows = jobs
    .map((job) => ({
      ...job,
      isTopRide: topRide && job === topRide,
    }));
  const platformRows = buildPlatformRows(platformSummary);

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GigPay Tracker Report</title>
        <style>
          @page {
            size: A4;
            margin: 18mm 14mm 20mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #1E293B;
            background: #F8FAFC;
            font-size: 12px;
            line-height: 1.45;
          }

          .report-shell {
            background: #F8FAFC;
          }

          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            padding: 0 0 22px;
            margin-bottom: 24px;
            border-bottom: 4px solid #2563EB;
            position: relative;
          }

          .header::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 130px;
            height: 4px;
            background: #F97316;
          }

          .brand-block {
            display: flex;
            align-items: center;
            gap: 18px;
          }

          .logo {
            width: 112px;
            height: auto;
            display: block;
          }

          .title {
            margin: 0;
            font-size: 30px;
            line-height: 1.1;
            color: #1E293B;
            font-weight: 800;
          }

          .subtitle {
            margin: 8px 0 0;
            color: #2563EB;
            font-size: 14px;
            font-weight: 700;
          }

          .meta-panel {
            min-width: 190px;
            text-align: right;
            color: #475569;
            font-size: 11px;
          }

          .meta-pill {
            display: inline-block;
            margin-bottom: 8px;
            padding: 6px 10px;
            border-radius: 999px;
            background: #DBEAFE;
            color: #2563EB;
            font-weight: 700;
          }

          .section {
            margin-bottom: 24px;
            page-break-inside: avoid;
          }

          .section-title {
            margin: 0 0 12px;
            font-size: 15px;
            color: #1E293B;
            font-weight: 800;
            letter-spacing: 0;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }

          .stat-card {
            background: #FFFFFF;
            border-radius: 14px;
            border: 1px solid #E2E8F0;
            border-top: 5px solid #2563EB;
            padding: 16px 14px;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
            min-height: 96px;
            page-break-inside: avoid;
          }

          .stat-label {
            font-size: 10px;
            color: #64748B;
            text-transform: uppercase;
            font-weight: 800;
            margin-bottom: 10px;
          }

          .stat-value {
            font-size: 21px;
            font-weight: 700;
            color: #1E293B;
            word-break: break-word;
          }

          .overview-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 16px;
          }

          .panel {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 16px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
            page-break-inside: avoid;
          }

          .kpi-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .kpi {
            padding: 12px;
            border-radius: 12px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
          }

          .kpi strong {
            display: block;
            margin-top: 6px;
            font-size: 18px;
            color: #1E293B;
          }

          .kpi span {
            color: #64748B;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 800;
          }

          .performance-copy {
            margin: 0;
            color: #475569;
          }

          .trend {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 12px;
            padding: 7px 10px;
            border-radius: 999px;
            background: #FFF7ED;
            color: #F97316;
            font-weight: 800;
          }

          .top-ride {
            border-left: 5px solid #F97316;
            background: #FFFFFF;
          }

          .top-ride-value {
            margin: 8px 0 4px;
            font-size: 20px;
            color: #F97316;
            font-weight: 800;
          }

          .top-ride-detail {
            margin: 0;
            color: #475569;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            overflow: hidden;
            table-layout: fixed;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
          }

          thead {
            display: table-header-group;
          }

          th,
          td {
            text-align: left;
            padding: 11px 12px;
            border-bottom: 1px solid #E2E8F0;
            font-size: 11px;
            vertical-align: top;
            word-break: break-word;
          }

          th {
            background: #2563EB;
            color: #FFFFFF;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0;
            font-size: 10px;
          }

          tbody tr:nth-child(even) td {
            background: #F8FAFC;
          }

          tbody tr:hover td,
          .highlight-row td {
            background: #FFF7ED;
          }

          .amount,
          .numeric {
            text-align: right;
            white-space: nowrap;
          }

          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 999px;
            background: #DBEAFE;
            color: #2563EB;
            font-size: 10px;
            font-weight: 800;
          }

          .status-cell,
          .status-badge {
            white-space: nowrap;
          }

          .share-bar {
            height: 7px;
            width: 100%;
            margin-top: 5px;
            border-radius: 999px;
            background: #E2E8F0;
            overflow: hidden;
          }

          .share-fill {
            height: 100%;
            border-radius: 999px;
            background: #F97316;
          }

          .page-break-safe {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .footer {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-top: 28px;
            padding-top: 14px;
            border-top: 1px solid #CBD5E1;
            color: #64748B;
            font-size: 10px;
          }

          @media print {
            body {
              background: #FFFFFF;
            }

            .section,
            .panel,
            .stat-card {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <main class="report-shell">
          <header class="header">
            <div class="brand-block">
              <img class="logo" src="${logoDataUri}" alt="GigPay Tracker logo" />
              <div>
                <h1 class="title">GigPay Tracker Report</h1>
                <p class="subtitle">Monthly Earnings Report</p>
              </div>
            </div>
            <div class="meta-panel">
              <div class="meta-pill">${escapeHTML(reportPeriod)}</div>
              <div>Generated: ${escapeHTML(reportTimestamp)}</div>
              <div>Report ID: ${escapeHTML(reportId)}</div>
            </div>
          </header>

          <section class="section">
            <div class="summary">
              <div class="stat-card">
                <div class="stat-label">Total Earnings</div>
                <div class="stat-value">${escapeHTML(formatCurrency(grossIncome))}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Jobs</div>
                <div class="stat-value">${escapeHTML(totalJobs)}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Average Earnings Per Ride</div>
                <div class="stat-value">${escapeHTML(formatCurrency(averageEarnings))}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Report Period</div>
                <div class="stat-value">${escapeHTML(reportPeriod)}</div>
              </div>
            </div>
          </section>

          <section class="section overview-grid">
            <div class="panel">
              <h2 class="section-title">Financial Overview</h2>
              <div class="kpi-row">
                <div class="kpi">
                  <span>Gross Income</span>
                  <strong>${escapeHTML(formatCurrency(grossIncome))}</strong>
                </div>
                <div class="kpi">
                  <span>Estimated Tax (5%)</span>
                  <strong>${escapeHTML(formatCurrency(estimatedTax))}</strong>
                </div>
                <div class="kpi">
                  <span>Net Income</span>
                  <strong>${escapeHTML(formatCurrency(netIncome))}</strong>
                </div>
              </div>
              <p class="performance-copy">
                This report summarizes completed ride earnings, estimated tax, platform contribution, and ride-level performance for the selected period.
              </p>
              <div class="trend">${trendSymbol} ${escapeHTML(trendLabel)}</div>
            </div>

            <div class="panel top-ride">
              <h2 class="section-title">Top Earning Ride</h2>
              <div class="top-ride-value">${escapeHTML(topRideAmount)}</div>
              <p class="top-ride-detail">
                ${topRide ? `${escapeHTML(topRide.title || 'Ride')} - ${escapeHTML(topRide.client || 'Unknown Platform')} - ${escapeHTML(topRide.date || 'N/A')}` : 'No rides available for this report period.'}
              </p>
            </div>
          </section>

          <section class="section page-break-safe">
            <h2 class="section-title">Platform Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th class="numeric">Total Rides</th>
                  <th class="amount">Earnings</th>
                  <th>Share %</th>
                </tr>
              </thead>
              <tbody>
                ${platformRows
                  .map((row) => {
                    const earnings = getNumber(row.totalEarnings);
                    const share = grossIncome > 0 ? (earnings / grossIncome) * 100 : 0;

                    return `
                      <tr>
                        <td><span class="badge">${escapeHTML(row.platform || 'Others')}</span></td>
                        <td class="numeric">${escapeHTML(row.totalRides || 0)}</td>
                        <td class="amount">${escapeHTML(formatCurrency(earnings))}</td>
                        <td>
                          ${escapeHTML(`${share.toFixed(1)}%`)}
                          <div class="share-bar"><div class="share-fill" style="width: ${Math.min(share, 100).toFixed(1)}%;"></div></div>
                        </td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </section>

          <section class="section">
            <h2 class="section-title">Ride History</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 20%;">Platform</th>
                  <th style="width: 31%;">Ride</th>
                  <th style="width: 17%;">Date</th>
                  <th class="amount" style="width: 16%;">Amount</th>
                  <th class="status-cell" style="width: 16%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${rideRows
                  .map(
                    (job) => `
                      <tr class="${job.isTopRide ? 'highlight-row' : ''}">
                        <td>${escapeHTML(job.client || 'N/A')}</td>
                        <td>${escapeHTML(job.title || 'N/A')}</td>
                        <td>${escapeHTML(job.date || 'N/A')}</td>
                        <td class="amount">${escapeHTML(job.amount || formatCurrency(0))}</td>
                        <td class="status-cell"><span class="badge status-badge">${escapeHTML(job.status || 'N/A')}</span></td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
          </section>

          <footer class="footer">
            <span>Generated by GigPay Tracker</span>
            <span>Report ID: ${escapeHTML(reportId)}</span>
            <span>${escapeHTML(reportTimestamp)}</span>
          </footer>
        </main>
      </body>
    </html>
  `;
}

async function generatePDF(data = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
