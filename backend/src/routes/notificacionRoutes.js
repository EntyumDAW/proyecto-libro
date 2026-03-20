import express from 'express';
import {marcarLeida, marcarTodasLeidas, getMisNotificaciones, getUnreadCount} from '../controllers/notificacionController.js'
import {auth} from '../middlewares/auth.js';

// Iniciamos el router
const router = express.Router();

// Ruta mis notis
router.get('/',auth, getMisNotificaciones);

// Ruta contar notificaciones
router.get('/no-leidas', auth, getUnreadCount);

// Ruta marcar leida una notidficaciones
router.put('/:id/leida', auth, marcarLeida);

// Ruta todas leidas
router.put('/todas-leidas', auth, marcarTodasLeidas);

export default router;



