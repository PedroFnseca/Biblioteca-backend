# DROP VIEW IF EXISTS VW_lending_CloseToDate_4
# DROP VIEW IF EXISTS VW_all_books;
# DROP VIEW IF EXISTS VW_lending_pending;
# DROP VIEW IF EXISTS VW_quantity;
# DROP VIEW IF EXISTS VW_lending_delay;
# DROP VIEW IF EXISTS VW_top_readers;
# DROP VIEW IF EXISTS VW_report_all_books;
# DROP VIEW IF EXISTS VW_report_lending_pending;
# DROP VIEW IF EXISTS VW_report_lending_returned;
# DROP VIEW IF EXISTS VW_all_users_with_lending;
# DROP VIEW IF EXISTS VW_lending_pending_report;

# Livros proximos da devolução de 4 dias
CREATE VIEW VW_lending_CloseToDate_4 AS
SELECT a.lending_code, a.return_prediction, b.user_name, b.user_email, c.book_name
	from tbl_lending a
		inner join tbl_user b on a.FK_user = b.user_code
		inner join tbl_book c on a.FK_book = c.book_code
			where return_date IS NULL AND return_prediction <= CURRENT_DATE + INTERVAL 4 DAY AND warning = false;


# Todos os livros com quantidade
CREATE VIEW VW_all_books AS
SELECT a.book_code, a.book_isbn, a.book_cdd, a.book_name, a.book_language, 
	   	 a.category_name, a.release_year, a.book_author, a.book_edition, 
			 a.book_position, a.book_tombo, b.quantity_total, b.quantity_circulation, 
			 b.quantity_stopped
	from tbl_book a
		inner join tbl_quantity b on a.book_code = b.FK_book
			where a.book_status = 'Ativo',
			order by a.book_code desc;


# Todos os emprestimos que estão pendentes
CREATE VIEW VW_lending_pending AS
SELECT a.lending_code, a.withdraw_date, a.return_prediction, b.user_name, 
       b.user_course, b.user_email, b.user_phone, c.book_name, d.librarian_name, 
			 a.overdue, a.penalty
	from tbl_lending a
		inner join tbl_user b on a.FK_user = b.user_code
		inner join tbl_book c on a.FK_book = c.book_code
		inner join tbl_librarian d on a.FK_librarian = d.librarian_code
			where a.return_date IS NULL
				order by a.lending_code desc;


# Quantidade de livros parados e em circulação, quantidade e total
CREATE VIEW VW_quantity AS
SELECT sum(b.quantity_total) as total, sum(b.quantity_circulation) as circulation, 
			 sum(b.quantity_stopped) as stopped
	from tbl_book a
		inner join tbl_quantity b on a.book_code = b.FK_book
			where a.book_status = 'Ativo';		


# Coleta os emprestimos em atraso
CREATE VIEW VW_lending_delay AS
	SELECT * from tbl_lending
		where return_date IS NULL AND return_prediction < (SELECT CURRENT_DATE);


# Coleta os emprestimos em atraso e que não sofreram penalidade no dia
CREATE VIEW VW_lending_delay_penalty AS
	SELECT lending_code from tbl_lending
		where return_date IS NULL AND return_prediction < (SELECT CURRENT_DATE) AND 
			(last_penaly_date != (SELECT CURRENT_DATE) OR last_penaly_date IS NULL);


# Coleta os 3 leitores que mais coletaram livros no ultimo mes
CREATE VIEW VW_top_readers AS
	SELECT a.user_name as name, COUNT(a.user_name) as count
		FROM tbl_user a
			inner join tbl_lending b on a.user_code = b.FK_user
				where b.withdraw_date >= (SELECT CURRENT_DATE - INTERVAL 1 MONTH) AND
				a.user_status = 'Ativo'
 					GROUP BY a.user_name
						ORDER BY COUNT(a.user_name) DESC
							LIMIT 3;						


# Relátorio para ver todos os livros registrados
CREATE VIEW VW_report_all_books as
select a.book_name "Título", a.book_author "Autor", a.book_edition "Edição", a.release_year "Ano",
	   a.category_name "Categoria", a.book_position "Posição", a.book_tombo "Tombo", a.book_isbn "ISBN",
       a.book_cdd "CDD", b.quantity_total "Quant. Total", b.quantity_stopped "Quant. Parado",
       b.quantity_circulation "Quant. Circulação"
	from tbl_book a
		inner join tbl_quantity b on a.book_code = b.FK_book
		where a.book_status = 'Ativo'
			order by a.book_code desc;


# Relátorio para ver todos os emprestimos que ainda não foram devolvidos
CREATE VIEW VW_report_lending_pending AS
SELECT a.book_name "Título", a.book_tombo "Tombo", a.book_position "Posição", b.user_name "Nome", 
			 b.user_course "Curso", b.user_email "Email", b.user_phone "Telefone", b.user_cpf "CPF", 
			 c.librarian_name "Emprestado por", d.withdraw_date "Data do emprestimo", 
			 d.return_prediction "Previsão de devolução", d.overdue "Dias de atraso", d.penalty "Penalidade"
	from tbl_book a
		join tbl_lending d on a.book_code = d.FK_book
		join tbl_user b on b.user_code = d.FK_user
		join tbl_librarian c on c.librarian_code = d.FK_librarian
			where d.return_date IS NULL
				order by d.withdraw_date desc;


# Relatorio para ver todos os emprestimos que já foram devolvidos
CREATE VIEW VW_report_lending_returned AS
SELECT a.book_name "Título", a.book_tombo "Tombo", a.book_position "Posição", b.user_name "Nome", 
			 b.user_course "Curso", b.user_email "Email", b.user_phone "Telefone", b.user_cpf "CPF", 
			 c.librarian_name "Emprestado por", d.withdraw_date "Data do emprestimo", 
			 d.return_prediction "Previsão de devolução", d.return_date "Data de devolução", 
			 d.overdue "Dias de atraso", d.penalty "Penalidade"
	from tbl_book a
		join tbl_lending d on a.book_code = d.FK_book
		join tbl_user b on b.user_code = d.FK_user
		join tbl_librarian c on c.librarian_code = d.FK_librarian
			where d.return_date IS NOT NULL
				order by d.withdraw_date desc;


# Todos os alunos com quantidade de livros pendentes e sem emprestimo
CREATE VIEW VW_all_users_with_lending AS
SELECT a.user_name, a.user_course, a.user_email, a.user_phone, a.user_cpf, a.user_type, a.user_code,
			 COUNT(b.lending_code) as count
	from tbl_user a
		left join tbl_lending b on a.user_code = b.FK_user
			where a.user_status = 'Ativo' AND b.return_date IS NULL
				GROUP BY a.user_name
					ORDER BY a.user_code DESC;

# Quantidade total de emprestimos pendentes, atrasados e a soma dos dois
CREATE VIEW VW_lending_pending_report as
SELECT
		(SELECT COUNT(lending_code) from tbl_lending where return_date IS NULL) as pending,
		(SELECT COUNT(lending_code) from tbl_lending where return_date IS NULL AND return_prediction < (SELECT CURRENT_DATE)) as delay,
		(SELECT COUNT(lending_code) from tbl_lending where return_date IS NULL) + (SELECT COUNT(lending_code) from tbl_lending where return_date IS NULL AND return_prediction < (SELECT CURRENT_DATE)) as total;