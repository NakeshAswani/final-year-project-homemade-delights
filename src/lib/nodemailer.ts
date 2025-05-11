import nodemailer from "nodemailer";

export const sendEmail = async (options: {
    to: string;
    subject: string;
    html: string
}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"HomeMade Delights" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
    });
};