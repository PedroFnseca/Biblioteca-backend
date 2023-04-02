import express from "express";
import db from "../services/LendingService.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Endpoint: /insert (POST)
// Descrição: Cadastra um emprestimo no banco de dados
router.post(
  "/insert",
  [
    body("librarian_id")
      .not()
      .isEmpty()
      .withMessage("Librarian id is required"),
    body("book_id").not().isEmpty().withMessage("Book id is required"),
    body("user_cpf").not().isEmpty().withMessage("User CPF is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { librarian_id, book_id, user_cpf } = req.body;

    try {
      const result = await db.createLending({
        librarian_id,
        book_id,
        user_cpf,
      });

      if (result) {
        res.status(401).json({
          error: result.error,
        });
      } else{
        res.status(200).json({
          message: "Lending created successfully!",
        });
      }

    } catch (error) {
      res.status(500).json({
        DatabaseError: error.message,
      });
    } finally{
      next();
    }
  }
);

// Endpoint: /return-book (UPDATE)
// Descrição: Devolve um livro
router.post(
  "/return-book",
  [body("lending_id").not().isEmpty().withMessage("Lending id is required")],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { lending_id } = req.body;

    try {
      const result = await db.returnBook(lending_id);

      if (result) {
        res.status(400).json({
          error: result.error,
        });
      } else{
        res.status(200).json({
          message: "Book returned successfully!",
        });
      }
      
    } catch (error) {
      res.status(500).json({
        DatabaseError: error.message,
      });
    } finally{
      next();
    }
  }
);

// Endpoint: /not-returned (GET)
// Descrição: Lista os emprestimos não devolvidos
router.get("/not-returned", async (req, res, next) => {
  try {
    const result = await db.getAllNotReturned();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      DatabaseError: error.message,
    });
  } finally{
    next();
  }
});

// Endpoint: /all (GET)
// Descrição: Lista todos os emprestimos
router.get("/all", async (req, res, next) => {
  try {
    const result = await db.getAll();

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      DatabaseError: error.message,
    });
  } finally{
    next();
  }
});

// Endpoint: /extendlending (PATCH)
// Descrição: Aumenta em 7 dias o empréstimo de livro
router.patch(
  "/extendlending",
  async (req, res, next) => {
    const { id } = req.query

    if(!id) {
      return res.status(400).json({
        message: "Lending id is required",
      });
    }

    try {
      await db.extendLending(id);

      res.status(200).json({
        message: "Lending extended successfully!",
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({
        DatabaseError: error.message,
      });
    } finally{
      next();
    }
  }
);

export default router;
