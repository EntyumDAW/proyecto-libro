import axiosCr from "../utils/api";

// Importa el getallanuncios del backend
export const getAllAnuncios = (filtros) => {
    return axiosCr.get('/anuncios', {params: filtros});
}

// Anuncio detallado por id
export const getAnuncioDetail = (id) => {
    return axiosCr.get(`/anuncios/${id}`);
}

// Anuncios del usuario
export const getMisAnuncios = () => {
    return axiosCr.get('/anuncios/mis-anuncios');
}

// Crear un anuncio
export const createAnuncio = (data) => {
    return axiosCr.post('/anuncios/crear-anuncio', data);
}

// Actualizar anuncios
export const updateAnuncio = (id, data) => {
    return axiosCr.put(`/anuncios/actualizar-anuncio/${id}`, data);
}

// Delete
export const deleteAnuncio = (id) => {
    return axiosCr.delete(`/anuncios/borrar-anuncio/${id}`);
}