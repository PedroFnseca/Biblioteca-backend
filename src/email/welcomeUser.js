import emailTemplate from "./template.js";
import sendEmail from "../services/sendEmail.js";

async function welcomeUser(name, to) {
  const html = emailTemplate(
    "Bem-vindo(a)!",
    name,
    "Agora você pode pegar livros emprestados na biblioteca da ETEC de Embu através do sistema BibliTec."
  );

  const subject = "Boas vindas!";

  try{
    await sendEmail(to, subject, html);
  } catch (error) {
    console.log(error.message);
  }
}

export default welcomeUser;
