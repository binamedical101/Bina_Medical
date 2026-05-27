import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || 'demo_user',
      pass: process.env.SMTP_PASS || 'demo_pass',
    },
  });

  // Define email options
  const mailOptions = {
    from: 'Bina Medical <noreply@binamedical.com>',
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
  }
};

export default sendEmail;
