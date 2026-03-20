import express from 'express';
import {searchBooks,getBookDetail,createBookManual} from '../controllers/libroController.js';
import {auth} from '../middlewares/auth.js';

// Inicializamos el router
const router = express.Router();

// Método para buscar todos los libros
router.get('/search', searchBooks);

// Método para conseguir todos los detalles de los libros
router.get('/:id', getBookDetail);

// Método para registrar un libro manualmente
router.post('/nuevo-libro', auth, createBookManual);

export default router;