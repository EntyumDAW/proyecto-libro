import axiosCr from '../utils/api';

// Obtener todos los favoritos del usuario autenticado
export const getMisFavoritos = () => {
    return axiosCr.get('/favoritos');
};

// Comprobar si un libro concreto está en favoritos (por isbn o google_id)
export const checkFavorito = (libroRef) => {
    return axiosCr.get(`/favoritos/${encodeURIComponent(libroRef)}`);
};

// Añadir o quitar un favorito (toggle)
export const toggleFavorito = (data) => {
    return axiosCr.post('/favoritos/toggle', data);
};
