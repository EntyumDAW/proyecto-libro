import {findByUsuario, create as createTransacciones, findById as findTransaccionId, update, updateData} from "../repositories/transaccionRepository.js";
import {findByEjemplarId as findIdEjemplar, update as updateEjemplar} from "../repositories/ejemplarRepository.js";
import {findById, update as updateAnuncio} from "../repositories/anuncioRepository.js";
import {create as createNotificacion} from "../repositories/notificacionRepository.js";

export const createTransaccion = async (req, res) => {
    try {

        // Recuperamos el id de anuncio y el ejemplar ofrecido
        const anuncioId = req.body.anuncio_id;
        const ejemplarOfrecido = req.body.ejemplar_ofrecido_id;
        
        // Recuperamos el anuncio con el id rescatado y la funcion del anunciorepository
        const anuncio = await findById(anuncioId);
        
        // Validacion para comprobar si el anuncio está activo
        if (anuncio.estado !== 'activo') throw new Error('El anuncio no está acivo');
        
        const usuario = req.user.id;
        // Validacion para comprobar si al solicitar un anuncio tú eres el creador del mismo
        if (usuario === anuncio.usuario) throw new Error('No puedes solicitar tu propio anuncio');
        
        // Si es intercambio, comprobamos que ejemplar ofrecido existe y que pertenece al usuario
        if (anuncio.tipo === 'intercambio') {
            const ejemplar = await findIdEjemplar(ejemplarOfrecido);
            if (!ejemplar || usuario != ejemplar.propietario) {
                throw new Error('Este ejemplar no te pertenece');
            }
            
            // Comprobamos si el anuncio acepta otros libros o si el ofrecido está dentro de los solicitados
            const libroAceptado = anuncio.intercambio_deseado.find(
                ic => ic.libro_deseado === ejemplar.libro
            );
            if (!anuncio.acepta_otros && !libroAceptado) throw new Error ('El libro ofrecido no es aceptado por el anunciante');
        }
        
        // Creamos objeto de transaccion
        let data = {
            solicitante: req.user.id,
            oferente: anuncio.usuario,
            anuncio: anuncioId,
            ejemplar_solicitado: anuncio.ejemplar,
            tipo: anuncio.tipo,
            estado: 'pendiente',
        }
        // Si es intercambio, añadimos al objeto ejemplar ofrecido
        if (anuncio.tipo === 'intercambio') data = {...data, ejemplar_ofrecido: ejemplarOfrecido};
        
        // Lo mismo si es venta con precio
        if (anuncio.tipo === 'venta') data = {...data, precio_acordado: anuncio.ejemplar.precio};
        
        // Creamos la transaccion
        const transaccion = await createTransacciones(data)

        // Despues creamos la notificacion
        const dataNotificacion = {
            tipo: 'intercambio_solicitado',
            usuario: anuncio.usuario,
            mensaje: "Nueva solicitud de transacción para tu anuncio",
            enlace: `/anuncios/${anuncio.id}`
        }
        await createNotificacion(dataNotificacion);

        await updateEjemplar(anuncio.ejemplar, {estado: 'reservado'});
        if (anuncio.tipo === 'intercambio') await updateEjemplar(ejemplarOfrecido, {estado: 'reservado'});
        res.status(201).json(transaccion);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const aceptarTransaccion = async (req, res) => {
    try {

        // Recuperamos el id de la transaccion
        const transaccionId = parseInt(req.params.id);
        
        // Buscamos la misma para tener el objeto completo
        const transaccion = await findTransaccionId(transaccionId);
        
        // Validamos si el usuario es el oferente en la transaccion
        const usuario = req.user.id;
        if (usuario !== transaccion.oferente) throw new Error('No autorizado');
        
        // Si la transaccion no está en pendiente, da error al intentar aceptarla
        if (transaccion.estado !== 'pendiente') throw new Error('La transacción no está disponible');

        // Actualizamos la transaccion si las validaciones han pasado
        const transaccionActualizada = await update(transaccionId, 'aceptada')

        // Actualizamos el anuncio a completado
        await updateAnuncio(transaccion.anuncio, {estado: 'completado'});

        // Despues creamos la notificacion
        const dataNotificacion = {
            tipo: 'transaccion_actualizada',
            usuario: transaccion.solicitante,
            mensaje: "Tu solicitud ha sido aceptada",
            enlace: `/anuncios/${transaccion.anuncio}`
        }
        await createNotificacion(dataNotificacion);
        

        res.status(200).json(transaccionActualizada);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const cancelarTransaccion = async (req, res) => {
    try {

        // Recuperamos el id de la transacción
        const transaccionId = parseInt(req.params.id);

        // Buscamos la transaccion con el id rescatado
        const transaccion = await findTransaccionId(transaccionId);

        const usuario = req.user.id;

        
        // Validamos si el usuaruo es el oferente y si la transacción está pendiente
        if (usuario !== transaccion.oferente && usuario !== transaccion.solicitante) throw new Error('No autorizado');
        if (transaccion.estado !== 'pendiente' && transaccion.estado !== 'aceptada') throw new Error('La transacción no se puede cancelar');
        
        // Actualizamos el estado a cancelada
        const transaccionActualizada = await update(transaccionId, 'cancelada');
        
        // Actualizamos el ejemplar solicitado a disponible
        await updateEjemplar(transaccion.ejemplar_solicita.id, {estado: 'disponible'});
        
        // Actualizamos el ofrecido si existe
        if (transaccion.ejemplar_ofrece) await updateEjemplar(transaccion.ejemplar_ofrece.id, {estado: 'disponible'});

        // Si la transaccion estaba aceptada, volvemos a poner el anuncio como activo
        if (transaccion.estado === 'aceptada') {
            await updateAnuncio(transaccion.anuncio, {estado: 'activo'});
        }
        
        // Determinamos quien es el usuario de la tarnsaccion
        const otroUsuario = usuario === transaccion.solicitante ? transaccion.oferente : transaccion.solicitante;
        // Despues creamos la notificacion
        const dataNotificacion = {
            tipo: 'transaccion_actualizada',
            usuario: otroUsuario,
            mensaje: "Tu solicitud ha sido cancelada",
            enlace: `/anuncios/${transaccion.anuncio}`
        }
        await createNotificacion(dataNotificacion);
        
        // Devolvemos la transacción actualizada
        res.status(200).json(transaccionActualizada);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}



export const completarTransaccion = async (req, res) => {
    try {

        // Recuperamos el id de la transacción
        const transaccionId = parseInt(req.params.id);
        const usuario = req.user.id;

        // Buscamos la transaccion con el id rescatado
        const transaccion = await findTransaccionId(transaccionId);

        // Validamos que el usuario es parte de la transacción y que está aceptada
        if (usuario !== transaccion.oferente && usuario !== transaccion.solicitante) throw new Error('No autorizado');
        if (transaccion.estado !== 'aceptada') throw new Error('La transacción no está aceptada');

        // Determinamos qué campo de confirmación corresponde al usuario actual
        const esOferente = usuario === transaccion.oferente;
        const campo = esOferente ? 'confirmado_oferente' : 'confirmado_solicitante';

        // Comprobamos que el usuario no haya confirmado ya
        if (transaccion[campo]) throw new Error('Ya has confirmado esta transacción');

        // Guardamos la confirmación de esta parte
        let transaccionActualizada = await updateData(transaccionId, { [campo]: true });

        // Si ambas partes han confirmado, completamos la transacción definitivamente
        if (transaccionActualizada.confirmado_oferente && transaccionActualizada.confirmado_solicitante) {

            // Actualizamos el estado de los ejemplares según el tipo de transacción
            if (transaccion.tipo === 'intercambio') {
                await updateEjemplar(transaccion.ejemplar_solicita.id, {estado: 'intercambiado'});
                if (transaccion.ejemplar_ofrece) await updateEjemplar(transaccion.ejemplar_ofrece.id, {estado: 'intercambiado'});
            }
            if (transaccion.tipo === 'venta') {
                await updateEjemplar(transaccion.ejemplar_solicita.id, {estado: 'vendido'});
            }

            // Marcamos el anuncio como completado
            await updateAnuncio(transaccion.anuncio, {estado: 'completado'});

            // Notificamos a ambas partes de que todo está confirmado
            await createNotificacion({
                tipo: 'transaccion_actualizada',
                usuario: transaccion.oferente,
                mensaje: '¡Transacción completada! Ambas partes han confirmado.',
                enlace: `/anuncios/${transaccion.anuncio}`
            });
            await createNotificacion({
                tipo: 'transaccion_actualizada',
                usuario: transaccion.solicitante,
                mensaje: '¡Transacción completada! Ambas partes han confirmado.',
                enlace: `/anuncios/${transaccion.anuncio}`
            });

            // Marcamos el estado final como completada
            transaccionActualizada = await update(transaccionId, 'completada');

        } else {
            // Solo una parte ha confirmado: notificamos a la otra que está esperando su confirmación
            const otroUsuario = esOferente ? transaccion.solicitante : transaccion.oferente;
            await createNotificacion({
                tipo: 'transaccion_actualizada',
                usuario: otroUsuario,
                mensaje: 'La otra parte ha confirmado la transacción. ¡Confirma tú también para completarla!',
                enlace: `/anuncios/${transaccion.anuncio}`
            });
        }

        // Devolvemos el estado actualizado de la transacción
        res.status(200).json(transaccionActualizada);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

export const getMisTransacciones = async (req, res) => {
    try {
        const usuario = req.user.id;
        const transacciones = await findByUsuario(usuario);
        res.status(200).json(transacciones);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}