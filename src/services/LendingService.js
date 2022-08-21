import db from '../Database/Connection.js'

// Realiza o emprestimo de livros
async function createLending(data){
    const {librian_id, book_id, user_id, withdraw_date, return_date} = data

    const conn = await db.connect()

    const sql = 'INSERT INTO tbl_lending (FK_librarian, FK_book, FK_user, withdraw_date) values (?, ?, ?, ?)'

    const values = [librian_id, book_id, user_id, withdraw_date]

    await conn.query(sql, values)

    conn.end()
}

// Devolve um livro
async function returnBook(data){
    const {lending_id, return_date} = data

    const conn = await db.connect()

    const sql = 'UPDATE tbl_lending SET return_date = ? WHERE id = ?'

    const values = [return_date, lending_id]

    await conn.query(sql, values)

    conn.end()
}

// Retorna todos os emprestimos não devolvidos
async function getAllNotReturned(){
    const conn = await db.connect()

    const sql = 'SELECT * FROM tbl_lending WHERE return_date IS NULL'

    const [rows] = await conn.query(sql)

    conn.end()

    return rows
}

// Retorna todos os emprestimos
async function getAll(){
    const conn = await db.connect()

    const sql = 'SELECT * FROM tbl_lending'

    const [rows] = await conn.query(sql)

    conn.end()

    return rows
}

export default{
    createLending,
    returnBook,
    getAllNotReturned,
    getAll
}