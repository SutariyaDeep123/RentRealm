export const FORGOTPASSWORD = (token) => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You've requested to reset your password. Please follow the instructions below:</p>
        
        <ol>
          <li>Click on the "Reset Password" button below.</li>
          <li>You'll be directed to a secure page where you can create a new password.</li>
          <li>Choose a strong, unique password that you haven't used before.</li>
          <li>After setting your new password, you'll be able to log in with it.</li>
        </ol>
        
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">Reset Password</a>
        
        <p style="margin-top: 20px; font-weight: bold; color: #ff0000;">Important: This link will expire in 24 hours for security reasons.</p>
        
        <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>
        
        <p>For your security, please:</p>
        <ul>
          <li>Never share this link with anyone.</li>
          <li>Ensure you're on our official website before entering your new password.</li>
          <li>Consider enabling two-factor authentication for added security.</li>
        </ul>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        
        <p style="margin-top: 20px; color: #888; font-size: 0.9em;">Best regards,<br>Your Support Team</p>
      </div>
    `;
}

export const invoiceEmail = (user, booking, type) => {
  const bookingDate = new Date(booking.createdAt).toLocaleDateString();
  const checkInDate = new Date(booking.checkIn).toLocaleDateString();
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString();
  
  let propertyDetails = '';
  let bookingType = '';
  
  if (type === 'hotel') {
    bookingType = 'Hotel Booking';
    propertyDetails = `
      <p><strong>Hotel:</strong> ${booking.hotel?.name || 'N/A'}</p>
      <p><strong>Room Type:</strong> ${booking.room?.type || 'N/A'}</p>
    `;
  } else {
    bookingType = 'Property Booking';
    propertyDetails = `
      <p><strong>Property Type:</strong> ${booking.listing?.propertyType || 'N/A'}</p>
      <p><strong>Listing Type:</strong> ${booking.listing?.type || 'N/A'}</p>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .invoice-title { color: #2c3e50; font-size: 24px; }
        .invoice-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .section { margin-bottom: 20px; }
        .section-title { border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 10px; color: #2c3e50; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
        .total { font-weight: bold; font-size: 18px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <h1 class="invoice-title">Booking Confirmation</h1>
          <p>Invoice #${booking._id.toString().substring(0, 8).toUpperCase()}</p>
        </div>
        
        <div class="invoice-details">
          <div class="details-grid">
            <div>
              <h3 class="section-title">Customer Details</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Booking Date:</strong> ${bookingDate}</p>
            </div>
            <div>
              <h3 class="section-title">Booking Details</h3>
              <p><strong>Type:</strong> ${bookingType}</p>
              <p><strong>Status:</strong> <span style="color: ${
                booking.status === 'confirmed' ? 'green' : 
                booking.status === 'cancelled' ? 'red' : 'orange'
              }">${booking.status}</span></p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Property Information</h3>
          ${propertyDetails}
          <p><strong>Check-in:</strong> ${checkInDate}</p>
          <p><strong>Check-out:</strong> ${checkOutDate}</p>
          <p><strong>Guests:</strong> ${booking.guestCount}</p>
        </div>
        
        <div class="section">
          <h3 class="section-title">Payment Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Base Price</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${booking.totalPrice}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">Taxes & Fees</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$0.00</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Total</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">$${booking.totalPrice}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Thank you for your booking! If you have any questions, please contact our support team.</p>
          <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};