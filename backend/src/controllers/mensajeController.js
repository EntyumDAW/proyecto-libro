import {
    getOrCreateConversacion,
    findConversacionesByUsuario,
    findMensajesByConversacion,
    createMensaje,
    marcarLeidos,
    countNoLeidos
} from '../repositories/mensajeRepository.js';

// Obtener todas las conversaciones del usuario autenticado
export const getMisConversaciones = async (req, res) => {
    try {
        const conversaciones = await findConversacionesByUsuario(req.user.id);
        res.status(200).json(conversaciones);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Iniciar o recuperar una conversación con otro usuario
export const iniciarConversacion = async (req, res) => {
    try {
        const { otro_usuario_id, transaccion_id } = req.body;

        if (!otro_usuario_id) throw new Error('Falta el ID del otro usuario');
        if (Number(otro_usuario_id) === req.user.id) throw new Error('No puedes enviarte mensajes a ti mismo');

        const conversacion = await getOrCreateConversacion(
            req.user.id,
            Number(otro_usuario_id),
            transaccion_id ? Number(transaccion_id) : null
        );

        res.status(200).json(conversacion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los mensajes de una conversación y marcarlos como leídos
export const getMensajes = async (req, res) => {
    try {
        const conversacion_id = parseInt(req.params.id);
        const mensajes = await findMensajesByConversacion(conversacion_id, req.user.id);

        // Marcamos como leídos los mensajes del otro usuario
        await marcarLeidos(conversacion_id, req.user.id);

        res.status(200).json(mensajes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Enviar un mensaje en una conversación existente
export const enviarMensaje = async (req, res) => {
    try {
        const conversacion_id = parseInt(req.params.id);
        const { contenido } = req.body;

        if (!contenido?.trim()) throw new Error('El mensaje no puede estar vacío');

        const mensaje = await createMensaje(
            conversacion_id,
            req.user.id,
            contenido.trim(),
            req.user.id
        );

        res.status(201).json(mensaje);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener el total de mensajes no leídos (para el badge del header)
export const getNoLeidos = async (req, res) => {
    try {
        const count = await countNoLeidos(req.user.id);
        res.status(200).json({ count });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
