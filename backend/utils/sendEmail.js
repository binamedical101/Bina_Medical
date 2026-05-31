import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const port = Number(process.env.SMTP_PORT) || 2525;
  const isSecure = port === 465;

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER || 'demo_user',
      pass: process.env.SMTP_PASS || 'demo_pass',
    },
    connectionTimeout: 5000, // 5 seconds timeout
    socketTimeout: 5000,
  });

  // Define email options
  const mailOptions = {
    from: `Bina Medical <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Support for HTML formatting
  };

  // Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', options.email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;
