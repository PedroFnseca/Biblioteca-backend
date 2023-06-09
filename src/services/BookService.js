import db from "../database/connection.js";

// Insere um novo livro no banco de dados
async function insertBook(data) {
  const { title, edition, isbn, year, category, cdd, idiom, author, position, tombo } = data;

  const book_sql = `INSERT INTO tbl_book 
    (book_name, book_edition, book_isbn, release_year, category_name, 
    book_cdd, book_language, book_author, book_position, book_tombo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const quantity_sql = `INSERT INTO tbl_quantity (FK_book) 
    VALUES ((SELECT book_code FROM tbl_book WHERE book_name = ? and book_edition = ? and
      book_isbn = ? and release_year = ? and category_name = ? and book_cdd = ? and
      book_language = ? and book_author = ? and book_position = ? and book_tombo = ?))`;

  const book_values = [
    title,
    edition,
    isbn,
    year,
    category,
    cdd,
    idiom,
    author,
    position,
    tombo
  ];

  const conn = await db.connect();

  const [rows] = await conn.query(
    "SELECT count(*) total FROM tbl_book WHERE book_name = ? and book_edition = ? and book_isbn = ? and release_year = ? and category_name = ? and book_cdd = ? and book_language = ? and book_author = ? and book_position = ? and book_tombo = ? and book_status = 'Ativo'",
    book_values
  );

  if (rows[0].total === 0) {
    await conn.query(book_sql, book_values);
    await conn.query(quantity_sql, book_values);

    conn.end();
    return true;
  }

  conn.end();
  return false;
}

// Coleta todos os livros do banco de dados
async function getAllBooks() {
  const conn = await db.connect();

  const [rows] = await conn.query("SELECT * FROM VW_all_books");

  conn.end();
  return rows;
}

async function getCountBooks() {
  const conn = await db.connect();

  const sql = "SELECT COUNT(*) AS total FROM tbl_book";

  const [rows] = await conn.query(sql);

  conn.end();
  return rows;
}

// Pesquisa o livro pelo autor
async function getBookByAuthor(author) {
  const conn = await db.connect();

  const sql = "SELECT * FROM tbl_book WHERE book_author like ?";
  const values = `%${author}%`;

  const [rows] = await conn.query(sql, values);

  conn.end();
  return rows;
}

// Pesquisa livro pelo nome
async function getBookByName(name) {
  const conn = await db.connect();

  const sql = "SELECT * FROM tbl_book WHERE book_name like ?";
  const values = `%${name}%`;

  const [rows] = await conn.query(sql, values);

  conn.end();
  return rows;
}

// Pesquisa livro por categoria
async function getBookByCategory(category) {
  const conn = await db.connect();

  const sql = "SELECT * FROM tbl_book WHERE category_name like ?";
  const values = `%${category}%`;

  const [rows] = await conn.query(sql, values);

  conn.end();
  return rows;
}

// Atualiza os dados do livro
async function updateBook(data) {
  const conn = await db.connect();

  const {
    title,
    edition,
    isbn,
    release_year,
    category,
    cdd,
    language,
    author,
    id,
    position,
    tombo
  } = data;

  const sql = `UPDATE tbl_book SET
        book_name = ?, book_edition = ?, book_isbn = ?, release_year = ?,
        category_name = ?, book_cdd = ?, book_language = ?, book_author = ?, book_position = ?, book_tombo = ?
            WHERE book_code = ?`;

  const values = [
    title,
    edition,
    isbn,
    release_year,
    category,
    cdd,
    language,
    author,
    position,
    tombo,
    id,
  ];

  await conn.query(sql, values);

  conn.end();
}

// deleta um livro
async function deleteBook(id) {
  const conn = await db.connect();

  const sql = "UPDATE tbl_book SET book_status = 'Inativo' WHERE book_code = ?";

  await conn.query(sql, id);

  conn.end();
}

// Altera a quantidade de livros
async function updateQuantity(data) {
  const { id, qtd_total, qtd_stopped} = data;

  const conn = await db.connect();

  const sql = `UPDATE tbl_quantity SET quantity_total = ?, quantity_stopped = ? WHERE FK_book = ?`;

  const values = [qtd_total, qtd_stopped, id];

  await conn.query(sql, values);

  conn.end();
}

export default {
  insertBook,
  getAllBooks,
  getCountBooks,
  getBookByAuthor,
  getBookByName,
  getBookByCategory,
  updateBook,
  deleteBook,
  updateQuantity,
};
