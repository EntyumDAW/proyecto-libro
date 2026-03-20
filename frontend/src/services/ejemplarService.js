import axiosCr from "../utils/api";

// Método para devolver todos los ejemplares de una persona
export const getEjemplares = () => {
return axiosCr.get('/ejemplares/mis-ejemplares');
}

// Método para devolver todos los ejemplares dado un libro
export const getEjemplaresByLibro = (libro_id) => {
    return axiosCr.get(`/ejemplares/${libro_id}`);
    
}

// Método para crear un ejemplar
export const createEjemplar = (data) => {
    return axiosCr.post(`/ejemplares/crear-ejemplar`, data);
}

// Método para actualizar un ejemplar existente
export const updateEjemplar = (id, data) => {
    return axiosCr.put(`/ejemplares/actualizar-ejemplar/${id}`, data)
}

// Método para borrar un ejemplar existente
export const deleteEjemplar = (id) => {
    return axiosCr.delete(`/ejemplares/borrar-ejemplar/${id}`);
}