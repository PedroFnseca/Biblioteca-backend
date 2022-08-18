import nodeMailer from 'nodemailer'


// Função para enviar o email
async function sendMail(to, subject, text) {

  // Transporter for Gmail
  const transporter = nodeMailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PWD_APP
      },
      tls: {
        rejectUnauthorized: false
      }
  });
  
  // Congig mail
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
  }

  await transporter.sendMail(mailOptions)
}

export default {
    sendMail
}