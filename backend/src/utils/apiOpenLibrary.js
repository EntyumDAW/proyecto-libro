import axios from 'axios';

const api = axios.create({
    timeout: 10000,
    headers: { 'User-Agent': 'LibroApp/1.0' }
});

// Caché
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60;

// Limitador de concurrencia
const pLimit = (concurrency) => {
    const queue = [];
    let active = 0;
    const next = () => {
        if (active >= concurrency || queue.length === 0) return;
        active++;
        const { fn, resolve, reject } = queue.shift();
        fn().then(resolve).catch(reject).finally(() => {
            active--;
            next();
        });
    };
    return (fn) => new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject });
        next();
    });
};

const limit = pLimit(15);

// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA - Google Books + portadas OpenLibrary
// ═══════════════════════════════════════════════════════════════

export const searchBooks = async (query, maxResults = 40) => {
    if (!query?.trim()) throw new Error('Query requerido');

    const cacheKey = `search:${query}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        console.log('📦 Cache hit');
        return cached.data;
    }

    // 1. Búsqueda rápida con Google Books
    console.log(`🔍 Buscando en Google Books: "${query}"`);
    const googleResponse = await api.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
            q: query,
            langRestrict: 'es',
            maxResults: Math.min(maxResults, 40),
            printType: 'books'
        }
    });

    const items = googleResponse.data.items || [];
    console.log(`📚 ${items.length} resultados de Google`);

    // 2. Enriquecer con portadas de OpenLibrary en paralelo
    const libros = await Promise.all(
        items.map(item => limit(() => enrichWithOpenLibraryCover(item)))
    );

    const resultado = libros.filter(Boolean);
    cache.set(cacheKey, { data: resultado, ts: Date.now() });
    
    console.log(`✅ ${resultado.length} libros con portada`);
    return resultado;
};

// ═══════════════════════════════════════════════════════════════
// Enriquecer con portada de OpenLibrary
// ═══════════════════════════════════════════════════════════════

const enrichWithOpenLibraryCover = async (googleItem) => {
    const info = googleItem.volumeInfo;
    const isbn = info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier
              || info.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier;

    const googleCover = info.imageLinks?.thumbnail
        ?.replace('zoom=1', 'zoom=3')
        ?.replace('&edge=curl', '')
        ?.replace('http://', 'https://') || null;

    let portadaUrl = null;
    
    try {
        const searchQuery = info.authors?.[0] 
            ? `${info.title} ${info.authors[0]}`
            : info.title;

        // 1. Buscar la obra
        const searchResponse = await api.get('https://openlibrary.org/search.json', {
            params: {
                q: searchQuery,
                limit: 1,
                fields: 'key,language'
            }
        });

        const obra = searchResponse.data.docs?.[0];
        
        // 2. Solo si tiene español, buscar ediciones
        if (obra?.language?.includes('spa')) {
            const editionsResponse = await api.get(
                `https://openlibrary.org${obra.key}/editions.json`,
                { params: { limit: 50 } }
            );

            const ediciones = editionsResponse.data.entries || [];
            
            // Buscar edición española con portada
            const edicionEsp = ediciones.find(ed => 
                ed.languages?.some(l => l.key === '/languages/spa') && 
                ed.covers?.length > 0
            );

            if (edicionEsp?.covers?.[0]) {
                portadaUrl = `https://covers.openlibrary.org/b/id/${edicionEsp.covers[0]}-L.jpg`;
            }
        }
    } catch {
        // Si falla, usamos Google
    }

    if (!portadaUrl) {
        portadaUrl = googleCover;
    }

    return {
        titulo: info.title,
        autor: info.authors?.[0] || 'Autor desconocido',
        isbn: isbn || null,
        portada_url: portadaUrl,
        portada_fallback: googleCover,
        sinopsis: info.description || 'Sin descripción',
        editorial: info.publisher || 'Desconocida',
        año_publicacion: info.publishedDate?.substring(0, 4),
        paginas: info.pageCount || null,
        google_id: googleItem.id
    };
};
// ═══════════════════════════════════════════════════════════════
// DETALLE POR ISBN
// ═══════════════════════════════════════════════════════════════

export const getBookByIsbn = async (isbn) => {
    const cacheKey = `isbn:${isbn}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return cached.data;
    }

    try {
        const response = await api.get(`https://openlibrary.org/isbn/${isbn}.json`);
        const data = response.data;

        let autorNombre = 'Autor desconocido';
        if (data.authors?.[0]?.key) {
            try {
                const autorResponse = await api.get(`https://openlibrary.org${data.authors[0].key}.json`);
                autorNombre = autorResponse.data.name || 'Autor desconocido';
            } catch { /* ignorar */ }
        }

        const libro = {
            titulo: data.title,
            autor: autorNombre,
            isbn: isbn,
            portada_url: data.covers?.[0] 
                ? getCoverUrl(data.covers[0], 'L') 
                : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
            sinopsis: typeof data.description === 'string' 
                ? data.description 
                : data.description?.value || 'Sin descripción',
            editorial: data.publishers?.[0] || 'Desconocida',
            año_publicacion: data.publish_date,
            paginas: data.number_of_pages,
            work_key: data.works?.[0]?.key,
            edition_key: data.key
        };

        cache.set(cacheKey, { data: libro, ts: Date.now() });
        return libro;

    } catch {
        return null;
    }
};

// ═══════════════════════════════════════════════════════════════
// PORTADA
// ═══════════════════════════════════════════════════════════════

export const getCoverUrl = (coverId, size = 'L') => {
    if (!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};