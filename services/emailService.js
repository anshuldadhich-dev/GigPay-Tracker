const nodemailer = require("nodemailer");
const fs = require("fs");

// ── Transporter — created once and reused ─────────────────────────────────────
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return _transporter;
}

/**
 * Sends a monthly earnings report email with PDF attachment.
 *
 * @param {Object}  opts
 * @param {string}  opts.to           — recipient email address
 * @param {string}  opts.name         — recipient name
 * @param {number}  opts.month        — report month (1-12)
 * @param {number}  opts.year         — report year
 * @param {string}  opts.pdfPath      — absolute path to the generated PDF file
 * @returns {Promise<Object>}         — nodemailer send result
 */
async function sendReportEmail({ to, name, month, year, pdfPath }) {
  const transporter = getTransporter();
  const monthName = new Date(year, month - 1).toLocaleString("en-US", {
    month: "long",
  });

  const pdfBuffer = fs.readFileSync(pdfPath);
  const fileName = `GigPay_Report_${month}_${year}.pdf`;

  const html = buildEmailTemplate({ name, month: monthName, year, fileName });

  const mailOptions = {
    from: `"GigPay Tracker" <${process.env.SMTP_USER}>`,
    to,
    subject: `GigPay Monthly Earnings Report — ${monthName} ${year}`,
    html,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email] Report sent to ${to} — Message ID: ${info.messageId}`);
  return info;
}

/**
 * Builds a professional HTML email body.
 */
function buildEmailTemplate({ name, month, year, fileName }) {
  const displayName = name || "Driver";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GigPay Monthly Earnings Report</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;">

          <!-- Header -->
          <tr>
            <td style="background-color:#082B6B;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:800;letter-spacing:-0.3px;">GigPay Tracker</h1>
              <p style="margin:6px 0 0;color:#C98D73;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Monthly Earnings Report</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#0F172A;">Hi ${escapeHTML(displayName)},</p>

              <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">
                Your monthly earnings report for <strong style="color:#0F172A;">${escapeHTML(month)} ${escapeHTML(String(year))}</strong> is ready.
                Please find the detailed PDF report attached to this email.
              </p>

              <!-- Info card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748B;">Report Period</td>
                        <td style="padding:6px 0;font-size:13px;color:#0F172A;font-weight:700;text-align:right;">${escapeHTML(month)} ${escapeHTML(String(year))}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748B;">Attachment</td>
                        <td style="padding:6px 0;font-size:13px;color:#0F172A;font-weight:700;text-align:right;">${escapeHTML(fileName)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#64748B;line-height:1.6;">
                This report includes your total rides, gross &amp; net earnings, fuel costs,
                platform-wise breakdown, and ride history for the month.
              </p>

              <p style="margin:0;font-size:13px;color:#64748B;line-height:1.6;">
                Thank you for using <strong style="color:#0F172A;">GigPay Tracker</strong>!
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F1F5F9;padding:18px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94A3B8;">
                This email was automatically generated by GigPay Tracker.<br />
                &copy; ${escapeHTML(String(year))} GigPay Tracker. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = { sendReportEmail };
