const nodemailer = require('nodemailer')
require('dotenv').config()

const sendEmailHandler = async (emailMessage) => {
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // true for 465, false for other ports 
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });


    let info = await transporter.sendMail(emailMessage);
    return info
}

module.exports = sendEmailHandler
