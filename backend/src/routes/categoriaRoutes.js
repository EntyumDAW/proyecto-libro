import express from 'express';
import { findAllCategories, createCategoria } from '../controllers/categoriaController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Método de categorias para devolver todas
router.get('/', findAllCategories);

// Método de categorias para crear una nueva
router.post('/nueva',auth, createCategoria)

export default router;