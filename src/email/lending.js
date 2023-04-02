import emailTemplate from "./template.js";
import sendEmail from "../services/sendEmail.js";

async function welcomeUser(
  name,
  to,
  book_name,
  lending_id,
  day_week,
  return_prediction
) {
  const html = emailTemplate(
    "Empréstimo realizado!",
    name,
    `<p>
            Você pegou o livro <b>${book_name}</b> emprestado na biblioteca da ETEC de Embu. Fique atento com o
            prazo, pois o atraso na devolução do livro resultará em multa.
          </p>
          <br>
          <p>
            Código do emprestimo: <b>${lending_id}</b>
            <br>
            Data de devolução: ${return_prediction} (${day_week})
          </p>`
  );

  const subject = "Empréstimo realizado!";

  try{
    await sendEmail(to, subject, html);
  } catch (error) {
    console.log(error.message);
  }
}

export default welcomeUser;
