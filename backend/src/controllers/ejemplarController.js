import {findByEjemplarId, findByLibroId, findByUsuarioId, create as createEjemplar, borrar, update} from "../repositories/ejemplarRepository.js";
import {findById, findByIsbn, create as createLibro} from "../repositories/libroRepository.js";
import {findByEjemplarId as findAnuncioEjemplar} from "../repositories/anuncioRepository.js";
import {findByEjemplar} from "../repositories/transaccionRepository.js";
export const getEjemplares = async (req, res) => {
    try {
        const usuario = req.user.id;
        const ejemplaresUsuario = await findByUsuarioId(usuario);
        res.status(200).json(ejemplaresUsuario);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const getEjemplaresByLibro = async (req, res) => {
    try {
        const ejemplaresDisponibles = await findByLibroId(req.params.libro_id);
        const ejemplaresStock = ejemplaresDisponibles.filter(item => item.stock > 0).map(async item => {
            const nombreLibro = await findById(item.libro);
            return {
                descripcion_estado: item.descripcion_estado,
                stock: item.stock,
                precio: item.precio,
                libro: nombreLibro.titulo,
                propietario: item.propietario,
                estado: item.estado,
                condicion: item.condicion
            }
        })
        const resueltos = await Promise.all(ejemplaresStock);
        res.status(200).json(resueltos);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const createEjemplares = async (req, res) => {
    try {
        const libroEncontrado = await findByIsbn(req.body.isbn)
        if(!libroEncontrado) {
            const libroCreado = {
                isbn: req.body.isbn,
                titulo: req.body.titulo,
                autor: req.body.autor,
                sinopsis: req.body?.sinopsis || null,
                año_publicacion: req.body?.año_publicacion ? parseInt(req.body.año_publicacion.toString().split('-')[0]) : null,
                editorial: req.body?.editorial || null,
                portada_url: req.body.portada_url
            }
            const libro = await createLibro(libroCreado);
            const data = {
            descripcion_estado: req.body?.descripcion_estado || null,
            stock: req.body?.stock || null,
            precio: req.body?.precio || null,
            libro: libro.id,
            estado: req.body.estado,
            condicion: req.body.condicion,
            propietario: req.user.id
        }

        const ejemplarCreado = await createEjemplar(data);
        res.status(200).json(ejemplarCreado);
    } else {
        const data = {
            descripcion_estado: req.body?.descripcion_estado || null,
            stock: req.body?.stock || null,
            precio: req.body?.precio || null,
            libro: libroEncontrado.id,
            estado: req.body.estado,
            condicion: req.body.condicion,
            propietario: req.user.id
        }
        const ejemplarCreado = await createEjemplar(data);
        res.status(200).json(ejemplarCreado)

    }
        
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const updateEjemplar = async (req, res) => {
    try {
        const ejemplar = await findByEjemplarId(req.params.id);
        if(ejemplar.propietario != req.user.id) throw new Error('Este ejemplar no te pertenece');
        const camposActualizados = {
            descripcion_estado: req.body?.descripcion_estado || null,
            stock: req.body?.stock || null,
            precio: req.body?.precio || null,
            estado: req.body?.estado,
            condicion: req.body?.condicion
        }
        const ejemplarActualizado = await update(req.params.id, camposActualizados);
        res.status(200).json(ejemplarActualizado);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const deleteEjemplar = async (req, res) => {
    try {
        const ejemplarId = parseInt(req.params.id);
        const ejemplar = await findByEjemplarId(ejemplarId);
        if(ejemplar.propietario != req.user.id) throw new Error('No puedes borrar un ejemplar que no te pertenece');

        // Buscamos anuncios asociados
        const anunciosEjemplar = await findAnuncioEjemplar(ejemplarId);
        if (anunciosEjemplar.length > 0) throw new Error('No puedes borrar un ejemplar asociado a anuncios. Borra el anuncio primero.')

            // Buscamos transacciones activas
            const transaccionesEjemplar = await findByEjemplar(ejemplarId);

            if (transaccionesEjemplar.length > 0) throw new Error('No puedes borrar un ejemplar con transacciones activas.')
        // Aqui iría lo de la transaccion, que aun no está puesto el repository ni nada
        const eliminado = await borrar(ejemplarId);
        if(eliminado) {
            const mensaje = 'Ejemplar eliminado correctamente';
            res.status(200).json(mensaje);
        }
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}