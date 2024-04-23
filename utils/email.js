const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
    // CREATE A TRANSPORTER (a service that will send the email)
    console.log(option);
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    //DEFINE EMAIL OPTIONS  
    const emailOptions = {
        from: 'Task Manager support<support@taskmanager.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }
    // SEND EMAIL
    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;