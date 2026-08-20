import nodemailer from 'nodemailer';

// Helper to create Nodemailer transporter
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure, // true for 465, false for 587 / STARTTLS
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Send Welcome Email to newly registered customers
 */
export async function sendWelcomeEmail({ name, email }) {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn('⚠️ SMTP not configured (SMTP_USER/SMTP_PASSWORD missing). Skipping Welcome Email.');
      return false;
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'jizajewellery@gmail.com';
    const fromName = process.env.SMTP_FROM_NAME || 'Jiza Jewellery Studio';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Jiza Jewellery Studio</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f6f0; margin: 0; padding: 0; color: #222; }
          .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e8dfd1; }
          .header { background-color: #1a1816; padding: 30px; text-align: center; border-bottom: 3px solid #d4af37; }
          .header h1 { color: #d4af37; font-size: 24px; margin: 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }
          .header p { color: #d8c3a5; font-size: 12px; margin: 5px 0 0 0; letter-spacing: 1px; }
          .content { padding: 40px 30px; line-height: 1.6; }
          .greeting { font-size: 20px; font-weight: bold; color: #1a1816; margin-bottom: 15px; }
          .text { font-size: 15px; color: #4a4642; margin-bottom: 20px; }
          .highlight-box { background-color: #fcf9f2; border-left: 4px solid #d4af37; padding: 15px 20px; margin: 25px 0; border-radius: 4px; }
          .highlight-box p { margin: 0; font-size: 14px; color: #333; }
          .cta-btn { display: inline-block; background-color: #d4af37; color: #1a1816; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; margin-top: 10px; text-align: center; }
          .footer { background-color: #f4eee3; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #e8dfd1; }
          .footer a { color: #d4af37; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JIZA JEWELLERY STUDIO</h1>
            <p>HERITAGE & TEMPLE JEWELLERY</p>
          </div>
          <div class="content">
            <div class="greeting">Welcome, ${name || 'Valued Customer'}!</div>
            <p class="text">Thank you for joining <strong>Jiza Jewellery Studio</strong>. Your customer account has been created successfully.</p>
            
            <div class="highlight-box">
              <p><strong>Registered Email:</strong> ${email}</p>
              <p><strong>Account Status:</strong> Active & Verified</p>
            </div>

            <p class="text">Explore our exquisite collection of Maharashtrian heritage sets, South Indian temple jewelry, Kundan, Victorian, and American Diamond masterworks handcrafted with precision.</p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://jizajewellery.com" class="cta-btn">Start Exploring Collection</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Jiza Jewellery Studio. All Rights Reserved.</p>
            <p>Shop No.17, 1st Floor, Shivpushp Landmark, Anand Nagar, Pune – 411051</p>
            <p>Need assistance? Contact us at <a href="mailto:jizajewellery@gmail.com">jizajewellery@gmail.com</a> | +91 82088 22696</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: '✨ Welcome to Jiza Jewellery Studio — Account Created Successfully',
      html: htmlContent
    });

    console.log(`✉️ [SMTP WELCOME EMAIL] Sent successfully to ${email}`);
    return true;
  } catch (err) {
    console.error(`⚠️ [SMTP EMAIL ERROR] Failed to send Welcome Email to ${email}:`, err.message);
    return false;
  }
}

/**
 * Send Order Confirmation Email to customers after confirmed payment
 */
export async function sendOrderConfirmationEmail({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  totalAmount,
  paymentMethod = 'Razorpay / Online',
  items = [],
  orderDate
}) {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn('⚠️ SMTP not configured (SMTP_USER/SMTP_PASSWORD missing). Skipping Order Confirmation Email.');
      return false;
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'jizajewellery@gmail.com';
    const fromName = process.env.SMTP_FROM_NAME || 'Jiza Jewellery Studio';

    const formattedDate = orderDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedAmount = `₹${Number(totalAmount || 0).toLocaleString('en-IN')}`;

    // Generate Itemized HTML Rows
    const itemsHtml = Array.isArray(items) && items.length > 0
      ? items.map(item => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
            <strong>${item.title || item.name || 'Jewellery Item'}</strong>
            ${item.selectedColor || item.colour ? `<br><small style="color: #666;">Colour: ${item.selectedColor || item.colour}</small>` : ''}
            ${item.selectedSize ? `<br><small style="color: #666;">Size: ${item.selectedSize}</small>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: center; color: #333;">x${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right; color: #333; font-weight: bold;">₹${Number((item.price || item.sellingPrice || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
        </tr>
      `).join('')
      : `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">Jiza Jewellery Order (${orderId})</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: center; color: #333;">1</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right; color: #333; font-weight: bold;">${formattedAmount}</td>
        </tr>
      `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed - Jiza Jewellery Studio</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f6f0; margin: 0; padding: 0; color: #222; }
          .container { max-width: 650px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e8dfd1; }
          .header { background-color: #1a1816; padding: 30px; text-align: center; border-bottom: 3px solid #d4af37; }
          .header h1 { color: #d4af37; font-size: 24px; margin: 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }
          .header p { color: #d8c3a5; font-size: 12px; margin: 5px 0 0 0; letter-spacing: 1px; }
          .content { padding: 35px 30px; line-height: 1.6; }
          .order-badge { display: inline-block; background-color: #d4af37; color: #1a1816; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .order-summary-box { background-color: #fcf9f2; border: 1px solid #e8dfd1; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .table-header { background-color: #1a1816; color: #ffffff; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
          .table-header th { padding: 10px 12px; font-weight: 600; text-align: left; }
          .total-row { background-color: #fcf9f2; font-size: 16px; font-weight: bold; color: #1a1816; }
          .footer { background-color: #f4eee3; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #e8dfd1; }
          .footer a { color: #d4af37; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JIZA JEWELLERY STUDIO</h1>
            <p>TAX INVOICE & ORDER CONFIRMATION</p>
          </div>
          <div class="content">
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="order-badge">✓ Payment Verified & Order Confirmed</span>
            </div>

            <h2 style="font-size: 20px; color: #1a1816; margin: 0 0 10px 0; text-align: center;">
              Thank You for Your Order, ${customerName}!
            </h2>
            <p style="font-size: 14px; color: #555; text-align: center; margin-bottom: 25px;">
              We have received your payment and your order is now being carefully packed with insured tamper-evident transit protection.
            </p>

            <div class="order-summary-box">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 4px 0; color: #666;">Order ID:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #1a1816;">${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666;">Order Date:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #1a1816;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666;">Payment Method:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #1a1816;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666;">Payment Status:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #2e7d32;">PAID (Verified)</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 16px; color: #1a1816; margin-top: 25px; margin-bottom: 12px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <thead>
                <tr class="table-header">
                  <th style="text-align: left;">Item Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="2" style="padding: 14px 12px; text-align: right; border-top: 2px solid #d4af37;">Final Amount Paid:</td>
                  <td style="padding: 14px 12px; text-align: right; color: #d4af37; font-size: 18px; border-top: 2px solid #d4af37;">${formattedAmount}</td>
                </tr>
              </tbody>
            </table>

            <h3 style="font-size: 16px; color: #1a1816; margin-bottom: 10px;">Shipping Destination</h3>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; font-size: 14px; color: #444; border: 1px solid #eee;">
              <strong>${customerName}</strong> (${customerPhone})<br>
              ${shippingAddress}
            </div>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Jiza Jewellery Studio. All Rights Reserved.</p>
            <p>Shop No.17, 1st Floor, Shivpushp Landmark, Anand Nagar, Pune – 411051</p>
            <p>For order queries, reach us at <a href="mailto:jizajewellery@gmail.com">jizajewellery@gmail.com</a> | +91 82088 22696</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: customerEmail,
      subject: `🛍️ Order Confirmed (${orderId}) — Jiza Jewellery Studio`,
      html: htmlContent
    });

    console.log(`✉️ [SMTP ORDER CONFIRMATION EMAIL] Sent successfully for Order ${orderId} to ${customerEmail}`);
    return true;
  } catch (err) {
    console.error(`⚠️ [SMTP EMAIL ERROR] Failed to send Order Confirmation Email for Order ${orderId}:`, err.message);
    return false;
  }
}
