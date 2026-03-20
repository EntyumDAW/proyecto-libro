import prisma from '../config/db.js';
import { cifrar, descifrar } from '../utils/cifrado.js';

// Normaliza el orden de los usuarios para garantizar que la unique constraint funcione
// siempre guardamos el ID menor como usuario1
const normalizarUsuarios = (u1, u2) => {
    return u1 < u2
        ? { usuario1: u1, usuario2: u2 }
        : { usuario1: u2, usuario2: u1 };
};

// Obtiene una conversación existente o crea una nueva entre dos usuarios
export const getOrCreateConversacion = async (usuarioActual, otroUsuario, transaccion_id = null) => {
    const { usuario1, usuario2 } = normalizarUsuarios(usuarioActual, otroUsuario);

    // Primero buscamos si ya existe la conversación
    let conversacion = await prisma.conversacion.findUnique({
        where: { usuario1_usuario2: { usuario1, usuario2 } },
        include: {
            usuario1_id: { select: { id: true, nombre_usuario: true } },
            usuario2_id: { select: { id: true, nombre_usuario: true } }
        }
    });

    // Si no existe, la creamos
    if (!conversacion) {
        conversacion = await prisma.conversacion.create({
            data: { usuario1, usuario2, transaccion: transaccion_id },
            include: {
                usuario1_id: { select: { id: true, nombre_usuario: true } },
                usuario2_id: { select: { id: true, nombre_usuario: true } }
            }
        });
    }

    return conversacion;
};

// Obtener todas las conversaciones de un usuario con el último mensaje descifrado
export const findConversacionesByUsuario = async (usuario_id) => {
    const conversaciones = await prisma.conversacion.findMany({
        where: {
            OR: [{ usuario1: usuario_id }, { usuario2: usuario_id }]
        },
        include: {
            usuario1_id: { select: { id: true, nombre_usuario: true } },
            usuario2_id: { select: { id: true, nombre_usuario: true } },
            // Solo el último mensaje para mostrar en la lista
            mensajes: {
                orderBy: { fecha: 'desc' },
                take: 1
            }
        },
        orderBy: { fecha_inicio: 'desc' }
    });

    // Desciframos el último mensaje de cada conversación
    return conversaciones.map(conv => ({
        ...conv,
        mensajes: conv.mensajes.map(msg => ({
            ...msg,
            contenido: descifrar(msg.contenido)
        }))
    }));
};

// Obtener todos los mensajes de una conversación (verifica que el usuario pertenece a ella)
export const findMensajesByConversacion = async (conversacion_id, usuario_id) => {
    // Verificamos que el usuario es parte de esta conversación
    const conversacion = await prisma.conversacion.findFirst({
        where: {
            id: conversacion_id,
            OR: [{ usuario1: usuario_id }, { usuario2: usuario_id }]
        }
    });

    if (!conversacion) throw new Error('No tienes acceso a esta conversación');

    const mensajes = await prisma.mensaje.findMany({
        where: { conversacion_id },
        include: {
            remitente_id: { select: { id: true, nombre_usuario: true } }
        },
        orderBy: { fecha: 'asc' }
    });

    // Desciframos todos los mensajes antes de devolverlos
    return mensajes.map(msg => ({
        ...msg,
        contenido: descifrar(msg.contenido)
    }));
};

// Envía un mensaje en una conversación (verifica acceso y cifra el contenido)
export const createMensaje = async (conversacion_id, remitente, contenido, usuario_id) => {
    // Verificamos que el remitente pertenece a la conversación
    const conversacion = await prisma.conversacion.findFirst({
        where: {
            id: conversacion_id,
            OR: [{ usuario1: usuario_id }, { usuario2: usuario_id }]
        }
    });

    if (!conversacion) throw new Error('No tienes acceso a esta conversación');

    // Ciframos el contenido antes de guardarlo en la base de datos
    const contenidoCifrado = cifrar(contenido);

    const mensaje = await prisma.mensaje.create({
        data: { conversacion_id, remitente, contenido: contenidoCifrado },
        include: {
            remitente_id: { select: { id: true, nombre_usuario: true } }
        }
    });

    // Devolvemos el mensaje con el contenido descifrado (legible para el cliente)
    return { ...mensaje, contenido };
};

// Marca como leídos todos los mensajes del otro usuario en una conversación
export const marcarLeidos = async (conversacion_id, usuario_id) => {
    return await prisma.mensaje.updateMany({
        where: {
            conversacion_id,
            remitente: { not: usuario_id },  // Solo los del otro usuario
            leido: false
        },
        data: { leido: true }
    });
};

// Cuenta los mensajes no leídos del usuario en todas sus conversaciones
export const countNoLeidos = async (usuario_id) => {
    // Obtenemos todas las conversaciones del usuario
    const conversaciones = await prisma.conversacion.findMany({
        where: {
            OR: [{ usuario1: usuario_id }, { usuario2: usuario_id }]
        },
        select: { id: true }
    });

    const ids = conversaciones.map(c => c.id);
    if (ids.length === 0) return 0;

    // Contamos los mensajes no leídos del otro usuario
    return await prisma.mensaje.count({
        where: {
            conversacion_id: { in: ids },
            remitente: { not: usuario_id },
            leido: false
        }
    });
};
