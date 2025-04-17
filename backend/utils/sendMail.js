const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASS
    }
});
async function sendEmail(email, subject, html,attachments) {
    await transporter.sendMail({
        to: email,
        subject: subject,
        html: html,
        attachments:attachments?attachments:undefined
    });
    return true;
}

module.exports = { sendEmail }