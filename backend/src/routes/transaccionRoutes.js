import express from 'express';
import {getMisTransacciones, createTransaccion, aceptarTransaccion, cancelarTransaccion, completarTransaccion} from '../controllers/transaccionController.js';
import {auth} from '../middlewares/auth.js';

// Primero se inicia el router
const router = express.Router();


//  Creamos la transacción
router.post('/',auth, createTransaccion);

// Buscamos todos los ejemplares disponibles de un libro
router.put('/:id/aceptar', auth, aceptarTransaccion);

// Crear un ejemplar
router.put('/:id/cancelar', auth, cancelarTransaccion);

// Actualizamos un ejemplar
router.put('/:id/completar', auth, completarTransaccion);

// Transacciones del usuario
router.get('/mis-transacciones', auth, getMisTransacciones);


export default router;