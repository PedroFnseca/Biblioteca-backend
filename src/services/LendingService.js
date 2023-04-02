import db from "../database/connection.js";
import dateFormat from "../utils/DateFormat.js";

// Realiza o emprestimo de livros
async function createLending(data) {
  const { librarian_id, book_id, user_cpf } = data;

  const conn = await db.connect();

  // Verifica se o usuario está cadastrado
  const sqlUser = `SELECT user_code, user_type FROM tbl_user WHERE user_cpf = "${user_cpf}"`;
  const [rows] = await conn.query(sqlUser);
  if (rows.length === 0) {
    conn.end();
    return { error: "Usuário não cadastrado!" };
  }
  const user_id = rows[0].user_code;
  const user_type = rows[0].user_type;

  // Verifica se o livro está disponivel
  const sqlBook =
    "SELECT * FROM tbl_quantity WHERE FK_book = ? AND quantity_stopped > 0";
  const [rowsBook] = await conn.query(sqlBook, book_id);
  if (rowsBook.length == 0) {
    conn.end();
    return { error: "Livro indisponível!" };
  }

  // Verifica se o usuário já tem mais de 2 emprestimos
  const sqlVerifyQuantity = "SELECT count(*) as count FROM tbl_lending WHERE FK_user = ? AND return_date IS NULL";

  const [rowsVerifyQuantity] = await conn.query(sqlVerifyQuantity, user_id);

  if (rowsVerifyQuantity[0].count >= 2 && user_type === "Aluno") {
    conn.end();
    return { error: "Usuário já possui 2 empréstimos!" };
  } else if(rowsVerifyQuantity[0].count >= 5 && user_type === "Funcionario") {
    conn.end();
    return { error: "Usuário já possui 5 empréstimos!" };
  }

  // Define a quantidade de dias para devolução
  const return_prediction = user_type === "Aluno" ? 7 : 14;

  // Realiza o emprestimo
  const sqlLending = "INSERT INTO tbl_lending (FK_librarian, FK_book, FK_user, return_prediction, withdraw_date) VALUES (?, ?, ?, (SELECT NOW() + INTERVAL ? DAY), (SELECT NOW()))";

  const values = [librarian_id, book_id, user_id, return_prediction];

  // Atualiza a quantidade de livros disponiveis
  const sqlQuantity = "UPDATE tbl_quantity SET quantity_stopped = quantity_stopped - 1, quantity_circulation = quantity_circulation + 1 WHERE FK_book = ?";

  await conn.query(sqlLending, values);
  await conn.query(sqlQuantity, book_id);

  conn.end();
}

// Devolve um livro
async function returnBook(lending_id) {
  const conn = await db.connect();

  // Verifica se o livro já foi devolvido
  const sqlVerify = `SELECT * FROM tbl_lending WHERE lending_code = "${lending_id}" AND return_date IS NULL`;
  const [rows] = await conn.query(sqlVerify);
  if (rows.length === 0) {
    conn.end();
    return { error: "Livro já devolvido!" };
  }

  // Realiza a devolução
  const sqlLending =
    "UPDATE tbl_lending SET return_date = (SELECT NOW()) WHERE lending_code = ?";

  // Atualiza a quantidade de livros disponiveis
  const sqlQuantity = "UPDATE tbl_quantity SET quantity_stopped = quantity_stopped + 1, quantity_circulation = quantity_circulation - 1 WHERE FK_book = (SELECT book_code FROM tbl_book WHERE book_code = (SELECT FK_book FROM tbl_lending WHERE lending_code = ?))";

  await conn.query(sqlLending, lending_id);
  await conn.query(sqlQuantity, lending_id);

  conn.end();
}

// Retorna todos os emprestimos não devolvidos
async function getAllNotReturned() {
  const conn = await db.connect();

  const sql = "SELECT * FROM VW_lending_pending ORDER BY lending_code DESC";

  const [rows] = await conn.query(sql);
  conn.end();

  rows.forEach((row) => {
    row.withdraw_date = dateFormat(row.withdraw_date);
    row.return_prediction = dateFormat(row.return_prediction);
  });
  return rows;
}

// Retorna todos os emprestimos
async function getAll() {
  const conn = await db.connect();

  const sql = "SELECT * FROM tbl_lending ORDER BY lending_code DESC";

  const [rows] = await conn.query(sql);

  conn.end();

  return rows;
}

// Adiona mais 7 dias para devolução
async function extendLending(lending_id) {
  const conn = await db.connect();

const sql = `UPDATE tbl_lending SET return_prediction = (SELECT NOW() + INTERVAL 7 DAY) WHERE lending_code = ${lending_id}`;

  await conn.query(sql);

  conn.end();
}

export default {
  createLending,
  returnBook,
  getAllNotReturned,
  getAll,
  extendLending,
};
