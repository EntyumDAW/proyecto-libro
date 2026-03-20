import express from 'express';
import { getMisFavoritos, checkFavorito, toggleFavorito } from '../controllers/favoritoController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Obtener todos los favoritos del usuario
router.get('/', auth, getMisFavoritos);

// Toggle (añadir o quitar) un favorito
router.post('/toggle', auth, toggleFavorito);

// Comprobar si un libro concreto es favorito (libroRef = isbn o google_id)
router.get('/:libroRef', auth, checkFavorito);

export default router;
