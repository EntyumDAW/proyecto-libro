import prisma from "../config/db.js";

// Función que devuelve todas las categorias existentes
export const findAll = () => {
    return prisma.categorias.findMany();
}

// Categoria por id
export const findById = (id) => {
    if(!id) throw new Error('ID requerido')
    return prisma.categorias.findUnique({where: {id}});
}

// Categoria por nombre
export const findByName = (nombre) => {
    if(!nombre) throw new Error('Nombre requerido')
    return prisma.categorias.findMany({where: {nombre: {contains: nombre}}});
}

// Crear categoria
export const create = (data) => {
    if(!data) throw new Error('Datos insuficientes');
    try {
        return prisma.categorias.create({data});
    } catch(error) {
        throw error;
    }
}