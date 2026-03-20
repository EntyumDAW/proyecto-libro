import express from 'express';
import {
    getMisConversaciones,
    iniciarConversacion,
    getMensajes,
    enviarMensaje,
    getNoLeidos
} from '../controllers/mensajeController.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Mensajes no leídos (badge del header) — debe ir antes de rutas con parámetros
router.get('/no-leidos', auth, getNoLeidos);

// Obtener todas las conversaciones del usuario
router.get('/conversaciones', auth, getMisConversaciones);

// Iniciar o recuperar una conversación con otro usuario
router.post('/conversaciones', auth, iniciarConversacion);

// Obtener mensajes de una conversación específica
router.get('/conversaciones/:id', auth, getMensajes);

// Enviar un mensaje en una conversación
router.post('/conversaciones/:id/mensajes', auth, enviarMensaje);

export default router;
