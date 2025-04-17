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


export const invoiceEmail = (user,booking,type) => {
 return `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${booking.guestCount}</p>
            <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <hr />
            <p>Thank you for your booking!</p>
        `}