import express from 'express';
import {getEjemplares, getEjemplaresByLibro, createEjemplares, updateEjemplar, deleteEjemplar} from '../controllers/ejemplarController.js';
import {auth} from '../middlewares/auth.js';

// Primero se inicia el router
const router = express.Router();


// Buscamos todos los ejemplares
router.get('/mis-ejemplares',auth, getEjemplares);

// Buscamos todos los ejemplares disponibles de un libro
router.get('/:libro_id', getEjemplaresByLibro);

// Crear un ejemplar
router.post('/crear-ejemplar',auth, createEjemplares);

// Actualizamos un ejemplar
router.put('/actualizar-ejemplar/:id',auth, updateEjemplar);

// Borramos un ejemplar
router.delete('/borrar-ejemplar/:id',auth, deleteEjemplar);

export default router;