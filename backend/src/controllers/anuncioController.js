import {findAll, findById, findByUsuario, deleteAnuncio, create, update} from "../repositories/anuncioRepository.js"
import {deleteByAnuncio, create as createIntercambio } from "../repositories/intercambioRepository.js";
import {findByIsbn, create as createLibro} from "../repositories/libroRepository.js";
import {create as createEjemplar} from "../repositories/ejemplarRepository.js";
import {findByAnuncio} from "../repositories/transaccionRepository.js";

export const createAnuncio = async (req, res) => {
    try {
        // Extraemos todo lo que necesitamos
        const {
            //Libro
            isbn, titulo, autor, portada_url, sinopsis, editorial, año_publicacion,
            // Ejemplar
            precio, stock, condicion, descripcion_estado,
            // Anuncio
            titulo_anuncio, descripcion, fecha_expiracion, lugar_recogida, metodo_pago, permite_envio, precio_envio, tipo,
            // Si hay intercambio
            libro_deseados, acepta_otros,
            ejemplar_id
        } = req.body

        let ejemplarFinal;

        if (ejemplar_id) {
            ejemplarFinal = {id: ejemplar_id};
        } else {
            // Y ahora lo agrupamos
            const datosLibro = {isbn, titulo, autor, portada_url, sinopsis, editorial, año_publicacion: typeof año_publicacion === 'string' ? parseInt(año_publicacion.split('-')[0]) : año_publicacion};
            

            // Buscamos libro por el isbn en la base de datos
            const libroBD = await findByIsbn(datosLibro.isbn);
            // Si no existe, creamos el libro con los datos recibidos
            const libro = libroBD || await createLibro(datosLibro);

            // Agrupamops los datos del ejemplar ahora que tenemos el libro creado
                const datosEjemplar = {precio: parseInt(precio), stock: parseInt(stock), condicion, descripcion_estado, libro: libro.id, propietario: req.user.id, estado: 'disponible'};
                
                // Creamos el ejemplar
            ejemplarFinal = await createEjemplar(datosEjemplar);
        }

        // Definimos y agrupamos con el ejemplar creado
        // acepta_otros se guarda directamente en el anuncio para que sea accesible siempre
        const datosAnuncio = {
            titulo: titulo_anuncio,
            descripcion,
            fecha_expiracion: new Date(fecha_expiracion),
            lugar_recogida: lugar_recogida || null,
            metodo_pago: metodo_pago || null,
            permite_envio: permite_envio || false,
            precio_envio: precio_envio || null,
            tipo,
            acepta_otros: acepta_otros || false,
            ejemplar: ejemplarFinal.id,
            usuario: req.user.id,
            estado: 'activo'
        };
        // Y ahora creamos el anuncio
        const anuncioCreado = await create(datosAnuncio);

        // Si el tipo es intercambio, creamos los libros deseados específicos
        if(datosAnuncio.tipo === 'intercambio' && Array.isArray(libro_deseados)) {
            for (const libroData of libro_deseados) {
                // Buscamos el libro primero
                let libroBuscado = await findByIsbn(libroData.isbn);
                if(!libroBuscado) {
                    const datosLibroDeseado = {
                        ...libroData,
                        año_publicacion: typeof libroData.año_publicacion === 'string'
                            ? parseInt(libroData.año_publicacion.split('-')[0])
                            : libroData.año_publicacion
                    };
                    libroBuscado = await createLibro(datosLibroDeseado);
                }
                await createIntercambio({
                    anuncio: anuncioCreado.id,
                    libro_deseado: libroBuscado.id,
                    acepta_otros: acepta_otros || false
                });
            }
        }
        res.status(200).json(anuncioCreado);
    } catch (error) {
        console.error('error al crear anuncio: ', error.message);
        res.status(400).json({error: error.message});
    }
}

// Rescatamos todos los anuncios dependiendo de lo que busca el usuario
export const getAllAnuncios = async (req, res) => {
    try {
        // Rescatamos los filtros necesarios para el findall del repository
        const filtros = {
            tipo: req.query.tipo,
            estado: req.query.estado || 'activo',
            search: req.query.search,
            // Filtro por ISBN para "ver anuncios" desde el detalle de un libro
            isbn: req.query.isbn || null
        }
        const anuncios = await findAll(filtros);
        res.status(200).json(anuncios);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}
// Rescatamos el id del anuncio para enseñarlo detalladamente cuando se seleccione
export const getAnuncioDetail = async (req, res) => {
    try {
        const anuncioId = parseInt(req.params.id);
        const anuncioDetallado = await findById(anuncioId);
        res.status(200).json(anuncioDetallado);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Rescatamos los anuncios del usuario
export const getAnunciosUsuario = async (req, res) => {
    try {
        const usuario = req.user.id;
        const anunciosUsuario = await findByUsuario(usuario);
        res.status(200).json(anunciosUsuario);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Update de un anuncio
export const updateAnuncio = async (req, res) => {
    try {
        // Rescatamos el intercambio anterior, usuario y propietario
        const intercambioAnterior = req.body.libro_deseado;
        const usuario = req.user.id;
        const anuncio = await findById(req.params.id);
        // Comprobamos si el propietario y usuario que requiere el update son el mismo
        if (usuario !== anuncio.usuario) throw new Error('No eres el propietario de este anuncio');
        // Actualizamos el anuncio (que viene del modal)
        const anuncioActualizado = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            fecha_expiracion: req.body.fecha_expiracion,
            lugar_recogida: req.body?.lugar_recogida || null,
            metodo_pago: req.body?.metodo_pago || null,
            permite_envio: req.body.permite_envio,
            precio_envio: req.body?.precio_envio || null,
            estado: req.body.estado,
            tipo: req.body.tipo
        }
        // Actualizamos el intercambio (modal tambien)
        const intercambioActualizado = {
            acepta_otros: req.body.acepta_otros || null,
            libro_deseado: req.body.libro_deseado,
            anuncio: req.body.anuncio
        }
        // Comprobamos si el intercambio anterior es igual al nuevo y si es diferente lo borra y lo crea de nuevo
        if (JSON.stringify(intercambioActualizado) !== JSON.stringify(intercambioAnterior)) {
            await deleteByAnuncio(anuncio.id);

            // Como libros deseados es un array se hace un bucle for para pasarlo a la funcion
            for (const libro_id of req.body.libro_deseado) {
                await createIntercambio({
                    anuncio: anuncio.id,
                    libro_deseado: libro_id,
                    acepta_otros: req.body.acepta_otros
                });
            }
        } 
        // Y ya creamos el nuevo anuncio y lo devolvemos
        const anuncioFinal = await update(anuncio.id, anuncioActualizado);
        res.status(200).json(anuncioFinal);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Borra el anuncio completo con cascade porque prisma ya lo tiene activo
export const deleteAnuncioController = async (req, res) => {
    try {
        // Recuperamos el usuario y el anuncio
        const usuario = req.user.id;
        const anuncio = parseInt(req.params.id);
        const anuncioPropietario = await findById(anuncio);

        // Si el usuario es diferente al usuario del anuncio da error
        if (usuario !== anuncioPropietario.usuario) throw new Error('No tienes permiso para borrar este anuncio');
        
        // Buscamos transacciones del anuncio y verificamos que no esten pendientes o aceptadas
        const anuncioTransacciones = await findByAnuncio(anuncio);

        const tieneTransaccionesCompletadas = anuncioTransacciones.some(
            t => t.estado === 'completada'
        );

        if (tieneTransaccionesCompletadas) throw new Error('No se pueden borrar anuncios con transacciones completadas.');

        // iteramos porque findByanuncio devuelve un array
        const tieneTransaccionesActivas = anuncioTransacciones.some(
            t => t.estado === 'pendiente' || t.estado === 'aceptada'
        );

        if (tieneTransaccionesActivas)
            throw new Error('No se pueden borrar anuncios con transacciones activas');

        // Borra el anuncio
        await deleteAnuncio(anuncio);

        // Y manda el mensaje de exito
        const mensaje = 'Anuncio borrado correctamente';
        res.status(200).json(mensaje);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}