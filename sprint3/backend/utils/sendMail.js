const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS
    }
});
async function sendEmail(email, subject, html) {
    await transporter.sendMail({
        to: email,
        subject: subject,
        html: html
    });
    return true;
}

module.exports = { sendEmail }