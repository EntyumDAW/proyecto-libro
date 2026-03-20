import express from 'express';
import {getAllAnuncios, createAnuncio, updateAnuncio, deleteAnuncioController, getAnuncioDetail, getAnunciosUsuario} from '../controllers/anuncioController.js';
import {auth} from '../middlewares/auth.js';

// Primero iniciamos el router
const router = express.Router();

// Ruta de todos los anuncios
router.get('/', getAllAnuncios);

// Ruta anuncios de usuario
router.get('/mis-anuncios',auth, getAnunciosUsuario);

// Ruta crear anuncio
router.post('/crear-anuncio', auth, createAnuncio);

// Ruta anuncio detallado
router.get('/:id', getAnuncioDetail);

// Ruta actualizacion anuncio
router.put('/actualizar-anuncio/:id',auth, updateAnuncio);

// Borramos un anuncio
router.delete('/borrar-anuncio/:id',auth, deleteAnuncioController);

export default router;