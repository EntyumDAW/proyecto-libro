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
        if (anuncio.estado !== 'activo') throw new Error('The listing is not active');
        
        const usuario = req.user.id;
        // Validacion para comprobar si al solicitar un anuncio tú eres el creador del mismo
        if (usuario === anuncio.usuario) throw new Error('You cannot request your own listing');
        
        // Si es intercambio, comprobamos que ejemplar ofrecido existe y que pertenece al usuario
        if (anuncio.tipo === 'intercambio') {
            const ejemplar = await findIdEjemplar(ejemplarOfrecido);
            if (!ejemplar || usuario != ejemplar.propietario) {
                throw new Error('This book does not belong to you');
            }
            
            // Comprobamos si el anuncio acepta otros libros o si el ofrecido está dentro de los solicitados
            const libroAceptado = anuncio.intercambio_deseado.find(
                ic => ic.libro_deseado === ejemplar.libro
            );
            if (!anuncio.acepta_otros && !libroAceptado) throw new Error ('The offered book is not accepted by the seller');
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
            mensaje: "New transaction request for your listing",
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
        if (usuario !== transaccion.oferente) throw new Error('Not authorized');
        
        // Si la transaccion no está en pendiente, da error al intentar aceptarla
        if (transaccion.estado !== 'pendiente') throw new Error('The transaction is not available');

        // Actualizamos la transaccion si las validaciones han pasado
        const transaccionActualizada = await update(transaccionId, 'aceptada')

        // Actualizamos el anuncio a completado
        await updateAnuncio(transaccion.anuncio, {estado: 'completado'});

        // Despues creamos la notificacion
        const dataNotificacion = {
            tipo: 'transaccion_actualizada',
            usuario: transaccion.solicitante,
            mensaje: "Your request has been accepted",
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
        if (usuario !== transaccion.oferente && usuario !== transaccion.solicitante) throw new Error('Not authorized');
        if (transaccion.estado !== 'pendiente' && transaccion.estado !== 'aceptada') throw new Error('The transaction cannot be cancelled');
        
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
            mensaje: "Your request has been cancelled",
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
        if (usuario !== transaccion.oferente && usuario !== transaccion.solicitante) throw new Error('Not authorized');
        if (transaccion.estado !== 'aceptada') throw new Error('The transaction is not accepted');

        // Determinamos qué campo de confirmación corresponde al usuario actual
        const esOferente = usuario === transaccion.oferente;
        const campo = esOferente ? 'confirmado_oferente' : 'confirmado_solicitante';

        // Comprobamos que el usuario no haya confirmado ya
        if (transaccion[campo]) throw new Error('You have already confirmed this transaction');

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
                mensaje: 'Transaction completed! Both parties have confirmed.',
                enlace: `/anuncios/${transaccion.anuncio}`
            });
            await createNotificacion({
                tipo: 'transaccion_actualizada',
                usuario: transaccion.solicitante,
                mensaje: 'Transaction completed! Both parties have confirmed.',
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
                mensaje: 'The other party has confirmed the transaction. Confirm too to complete it!',
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