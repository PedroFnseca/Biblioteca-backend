import express from "express"
import books from './controllers/BookController.js'
import librian from './controllers/LibrianController.js'
import Nodemailer from "./Mail/Nodemailer.js"

const router = express.Router()

router.use('/book', books)
router.use('/librian', librian)
router.use('/email', Nodemailer)

router.use('*', (req, res) => {
    res.status(404).json({
        notfound: 'verify on github the endpoints',
        by: '@BibliON'
    })
})

export default router
