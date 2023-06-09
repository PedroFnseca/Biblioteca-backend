import db from "../database/connection.js";
import closeToDateEmail from "../email/closeToDate.js"
import sendMail from "../services/sendEmail.js";

// Coleta os empréstimos que estão para vencer
async function getCloseToDate() {
  const conn = await db.connect();

  const sql = "SELECT * FROM VW_lending_CloseToDate_4";

  const [rows] = await conn.query(sql);

  if (rows.length === 0) {
    conn.end();
    return rows;
  }

  // Para cada emprestimo proximo ao vencimento coletado, ele marca como avisado
  for (const row of rows) {
    await conn.query(
      "UPDATE tbl_lending SET warning = true WHERE lending_code = ?",
      [row.lending_code]
    );
  }

  conn.end();
  return rows;
}

// Para cara emprestimo que está para vencer encontrado ele envia email para o usuário
export default async function(){

  try {
    const closeToDate = await getCloseToDate();

    if (closeToDate.length === 0) return;
  
    for (const row of closeToDate) {
      // Formata a data de: 2022-10-20T00:00:00.000Z para: 20/10/2022
      const return_prediction_formatted = row.return_prediction
        .toISOString()
        .split("T")[0]
        .split("-")
        .reverse()
        .join("/");
  
      // Formata a data de: 2022-10-20T00:00:00.000Z para: Segunda-feira
      const return_prediction_day = new Date(
        row.return_prediction
      ).toLocaleDateString("pt-BR", { weekday: "long" });
  
      const email = closeToDateEmail(
        row.user_name,
        row.book_name,
        return_prediction_formatted,
        return_prediction_day,
        row.lending_code
      );
  
      sendMail(row.user_email, "Empréstimo próximo ao vencimento", email);
    }
  } catch (error) {
    console.error(error)
  }
}
