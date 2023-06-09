import db from "../database/connection.js";

// Coleta os empréstimos que estão atrasados que ainda não sofreram multa no dia
async function getOverdue() {
  const conn = await db.connect();

  const sql = "SELECT * FROM VW_lending_delay_penalty";

  const [rows] = await conn.query(sql);

  conn.end();
  return rows;
}

// Para cara emprestimo atrasado encontrado ele aplica multa dentro do bd
export default async function(){
  const lendings = await getOverdue();

  if (lendings.length === 0) return;
  
  const conn = await db.connect();

  try {
    for (const lending of lendings) {
      await conn.query("CALL SP_lending_penalty(?)", lending.lending_code);
    }
  } catch (error) {
    // console.error(error)
  } finally {
    conn.end();
  }
}
