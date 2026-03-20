import { findByUsuario, findByUsuarioYRef, create, remove } from '../repositories/favoritoRepository.js';

// Obtener todos los favoritos del usuario autenticado
export const getMisFavoritos = async (req, res) => {
    try {
        const favoritos = await findByUsuario(req.user.id);
        res.status(200).json(favoritos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Comprobar si un libro concreto está en favoritos del usuario
export const checkFavorito = async (req, res) => {
    try {
        const { libroRef } = req.params;
        const favorito = await findByUsuarioYRef(req.user.id, libroRef);
        res.status(200).json({ esFavorito: !!favorito });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Toggle favorito: añade si no está, elimina si ya está
export const toggleFavorito = async (req, res) => {
    try {
        const { libro_ref, titulo, autor, portada_url } = req.body;

        // Validamos que lleguen los datos mínimos del libro
        if (!libro_ref || !titulo || !autor || !portada_url) {
            throw new Error('Faltan datos del libro (libro_ref, titulo, autor, portada_url)');
        }

        // Comprobamos si el libro ya está en favoritos
        const existe = await findByUsuarioYRef(req.user.id, libro_ref);

        if (existe) {
            // Si ya está, lo eliminamos
            await remove(req.user.id, libro_ref);
            return res.status(200).json({ esFavorito: false, mensaje: 'Eliminado de favoritos' });
        }

        // Si no existe, lo añadimos
        const favorito = await create({
            usuario: req.user.id,
            libro_ref,
            titulo,
            autor,
            portada_url
        });

        res.status(201).json({ esFavorito: true, favorito, mensaje: 'Añadido a favoritos' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
