import prisma from "../config/db.js";

// Función para buscar usuario id
export const findByUsuarioId = async (usuario_id) => {
    if (!usuario_id) throw new Error('ID de usuario necesario');
    return await prisma.ejemplares.findMany({ where: {propietario: usuario_id}, include: {libro_id: true}});
}

// Función para buscar ejemplares de un libro específico
export const findByLibroId = async (libro_id) => {
    if (!libro_id) throw new Error('ID de libro necesario');
    return await prisma.ejemplares.findMany({where: {libro: libro_id}});
}

// Función para buscar un ejemplar específico
export const findByEjemplarId = async (id) => {
    if (!id) throw new Error('ID del ejemplar necesario');
    return await prisma.ejemplares.findUnique({where: {id}});
}

// Función para crear un ejemplar
export const create = async (data) => {
    if (!data) throw new Error('Revisa los campos obligatorios');
    try {
        return await prisma.ejemplares.create({data});
    } catch (error) {
        throw error;
    }
}

// Función para actualizar los datos de algún ejemplar
export const update = async (id, data) => {
    if (!data) throw new Error('Revisa los campos obligatorios');
    try {
       return await prisma.ejemplares.update({where: {id}, data})
    } catch (error) {
        throw error;
    }
}

// Función para eliminar un ejemplar específico
export const borrar = async (id) => {
    if (!id) throw new Error('ID necesario');
    try {
       return await prisma.ejemplares.delete({where: {id}})
    } catch (error) {
        throw error;
    }
}