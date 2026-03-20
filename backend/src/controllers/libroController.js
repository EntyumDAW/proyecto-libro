import {searchBooks as searchBooksGoogle, getBookById, getBookByIsbn} from "../utils/apiGoogle.js";
import {findByIsbn, findById, searchByAutor, searchByTitle, create} from "../repositories/libroRepository.js";
import {findByName, findById as findCategoriaById} from "../repositories/categoriaRepository.js";
import prisma from "../config/db.js";

export const searchBooks = async (req, res) => {
    try {
        // Primero extraemos la query del req
        const query = req.query.q;
        
        const libros = await searchBooksGoogle(query, 40, 0);

        // Limpiamos el html que llega de la aplicación de google
        const limpiarHTML = (html) => {
            if(!html) return null
            return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .trim();
        };

        // Filtramos los libros con lo que nos interesa
        const librosFiltrados = libros
        .filter(item => item.volumeInfo?.imageLinks)
        .filter(item => item.volumeInfo?.description);

        const librosDetalles = librosFiltrados.map((item) => {
            const imgs = item.volumeInfo?.imageLinks || {};
            const isbn13 = item.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier;

            // zoom=1: thumbnail garantizado, siempre disponible, sin imagen gris
            const base = imgs.thumbnail || imgs.smallThumbnail;
            const portada = base
                ?.replace('http://', 'https://')
                ?.replace('&edge=curl', '')
                ?.replace(/zoom=\d+/, 'zoom=2');

        return {
            id: item.id,
            titulo: item.volumeInfo.title,
            autor: item.volumeInfo?.authors?.[0],
            isbn: isbn13,
            portada_url: portada,
            sinopsis: limpiarHTML(item.volumeInfo?.description),
            editorial: item.volumeInfo?.publisher,
            año_publicacion: item.volumeInfo?.publishedDate
        }
    });

        // Normalizamos el texto para quitar ediciones repetidas con titulo ligeramente diferente
        const normalizarTitulo = (titulo) => {
            if(!titulo) return '';
            return titulo   
                    .toLowerCase()
                    .split('/')[0]
                    .replace(/\(.*?\)/g, '')
                    .replace(/\[.*?\]/g, '')
                    .replace(/[^a-záéíóúñü0-9\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
        }
        // Filtramos y quitamos losduplicados
        const librosUnicos = librosDetalles.filter((libro, index, self) => 
            index === self.findIndex(l => normalizarTitulo(l.titulo) === normalizarTitulo(libro.titulo)));
        res.status(200).json(librosUnicos);

    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

export const getBookDetail = async (req, res) => {
    try {
        // Primero rescatamnos el id
        const param = req.params.id;
        const esISBN = /^\d{10}$|^\d{13}$/.test(param);

        // Helper para portadas de detalle (zoom=5 para máxima calidad disponible)
        const mejorarPortadaDetalle = (imgs) => {
            const base = imgs.thumbnail || imgs.smallThumbnail;
            if (!base) return null;
            return base
                .replace('http://', 'https://')
                .replace('&edge=curl', '')
                .replace(/zoom=\d+/, 'zoom=5');
        };

        // Comprobamos si es ISBN
        if(esISBN) {
            // Primero buscamos en la base de datos
            let libroEncontrado = await findByIsbn(param)

            // Si no encuentra el libro en la base de datos, lo busca en la api de google, mapea todo y lo devuelve.
            if(!libroEncontrado) {
                const libro = await getBookByIsbn(param);
                const primerLibro = libro[0];
                const imgs = primerLibro.volumeInfo?.imageLinks || {};
                const isbn13 = primerLibro.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier;
                const portada = mejorarPortadaDetalle(imgs);
                libroEncontrado = {
                        titulo: primerLibro.volumeInfo.title,
                        autor: primerLibro.volumeInfo?.authors?.[0],
                        isbn: isbn13,
                        portada_url: portada,
                        sinopsis: primerLibro.volumeInfo?.description,
                        editorial: primerLibro.volumeInfo?.publisher,
                        año_publicacion: primerLibro.volumeInfo?.publishedDate
                }
                res.status(200).json(libroEncontrado);
            } else {
                res.status(200).json(libroEncontrado);
            }
        } else {
            // Si no es un isbn, buscamos directamente en la api de google con su id
            const libroApi = await getBookById(param);
            const imgs = libroApi.volumeInfo?.imageLinks || {};
            const isbn13 = libroApi.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier;
            const portadaGoogle = mejorarPortadaDetalle(imgs);
            const portada = isbn13
                ? `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg?default=false`
                : portadaGoogle;

            const librosMapeados = {
                        titulo: libroApi.volumeInfo.title,
                        autor: libroApi.volumeInfo?.authors?.[0],
                        isbn: isbn13,
                        portada_url: portada,
                        sinopsis: libroApi.volumeInfo?.description,
                        editorial: libroApi.volumeInfo?.publisher,
                        año_publicacion: libroApi.volumeInfo?.publishedDate
                    }
                res.status(200).json(librosMapeados);

            }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

export const createBookManual = async (req, res) => {
try {
    // Verificamos que los datos son correctos (los obligatorios)
    if(!req.body.titulo || !req.body.autor || !req.body.sinopsis || !req.body.portada || !req.body.categorias) throw new Error('Revisa los campos obligatorios.')
    // Si lo son, los agregamos a un objeto libro
    const libro = {
        titulo: req.body.titulo,
        autor: req.body.autor,
        isbn: req.body?.isbn || null,
        año_publicacion: req.body?.año_publicacion || null,
        editorial: req.body?.editorial || null,
        sinopsis: req.body.sinopsis,
        portada_url: req.body.portada
}

// Creamos el libro directamente
const libroCreado = await create(libro);

// Guardamos también el librocon el genero
const categorias = req.body.categorias;
await prisma.libro_categoria.createMany({
    data: categorias.map(cat_id => ({
        libro_id: libroCreado.id,
        categoria_id: cat_id
    }))
})
res.status(200).json(libroCreado);
} catch(error) {
    res.status(400).json({error: error.message});
}
}
