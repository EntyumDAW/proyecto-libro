import {findByUsuario, markAllAsRead, markAsRead, create, countUnread} from "../repositories/notificacionRepository.js";


// Recupera todas las notificaciones del usuario
export const getMisNotificaciones = async (req, res) => {
    try {
        // Tecuperamos usuario
        const usuario = req.user.id;

        // Sacamos las notificaciones del usuario
        const notificaciones = await findByUsuario(usuario);
        res.status(200).json(notificaciones)
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}


// Marca una sola notificacion como leida
export const marcarLeida = async (req, res) => {
    try {
        // Recuperamos el id de la notificacion
        const notificacionRecuperada = parseInt(req.params.id);
        const usuario = req.user.id;

        // La marcamos como leida
        const notificacionLeida = await markAsRead(notificacionRecuperada);
        const mensaje = 'Notificacion marcada como leída';
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Marcar todas las notis como leidas
export const marcarTodasLeidas = async (req, res) => {
    try {
        // Recuperamos el usuario
        const usuario = req.user.id;

        // Llamamos a la funcion
        const todasLeidas = await markAllAsRead(usuario);
        const mensaje = 'Todas las notificaciones marcadas como leidas';
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Cuenta las notis sin leer de un usuario
export const getUnreadCount = async (req, res) => {
    try {
        // Recuperamos usuario
        const usuario = req.user.id;

        // Rescatamos el total de las notificaciones que tiene el usuario
        const totalNotificaciones = await countUnread(usuario);
        res.status(200).json({count: totalNotificaciones});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}