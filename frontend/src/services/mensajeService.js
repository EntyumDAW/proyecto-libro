import axiosCr from '../utils/api';

// Obtener el número de mensajes no leídos (para el badge)
export const getNoLeidos = () => {
    return axiosCr.get('/mensajes/no-leidos');
};

// Obtener todas las conversaciones del usuario
export const getMisConversaciones = () => {
    return axiosCr.get('/mensajes/conversaciones');
};

// Iniciar o recuperar una conversación con otro usuario
export const iniciarConversacion = (otro_usuario_id, transaccion_id = null) => {
    return axiosCr.post('/mensajes/conversaciones', { otro_usuario_id, transaccion_id });
};

// Obtener todos los mensajes de una conversación
export const getMensajes = (conversacion_id) => {
    return axiosCr.get(`/mensajes/conversaciones/${conversacion_id}`);
};

// Enviar un mensaje en una conversación
export const enviarMensaje = (conversacion_id, contenido) => {
    return axiosCr.post(`/mensajes/conversaciones/${conversacion_id}/mensajes`, { contenido });
};
