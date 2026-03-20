import prisma from '../config/db.js';

// Funcion para buscar en la base de datos libro dado un isbn
export const findByIsbn = (isbn) => {
    if(!isbn) throw new Error('ISBN requerido');
    return prisma.libros.findUnique({where: {isbn}});
}

// Funcion que busca libros por id
export const findById = (id) => {
    if(!id) throw new Error('ID requerido');
    return prisma.libros.findUnique({where: {id}});
}

// Funcion que busca libros por titulo
export const searchByTitle = (titulo) => {
    if(!titulo) throw new Error('Titulo requerido');
    return prisma.libros.findMany({where: {titulo: {contains: titulo}}});
}

// Funcion que busca libros por autor
export const searchByAutor = (autor) => {
    if(!autor) throw new Error('Autor requerido');
    return prisma.libros.findMany({where: {autor: {contains: autor}}});
}

// Funcion que crea un libro directamente en la base de dator
export const create = (data) => {
    if(!data) throw new Error('Datos insuficientes');
    try {
        return prisma.libros.create({data});
    } catch(error) {
        throw error;
    }
}