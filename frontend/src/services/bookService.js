import axiosCr from "../utils/api";

// Método ara buscar libros por autor, titulo, etc...
export const searchBooks = (query) => {
return axiosCr.get(`/libros/search?q=${query}`);
}

// Método para obtener un libro por id/isbn
export const getBookById = (id) => {
    return axiosCr.get(`/libros/${id}`)
}

// Método para la creación manual de nuevos libros
export const createBookManual = (data) => {
    return axiosCr.post('/libros/nuevo-libro', data);
}