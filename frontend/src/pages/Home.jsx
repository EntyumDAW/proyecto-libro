import {useState, useEffect} from "react";
import {Pagination, CircularProgress, Alert, Box, useMediaQuery, useTheme} from "@mui/material";
import {searchBooksGoogle} from "../services/googleBooksService.js";
import {BookCard} from "../components/BookCard";
import {PageLayout} from "../components/PageLayout.jsx";

export const Home = ({searchQuery}) => {
    // Primero ponemos los estados necesarios para la página principal
    const [libros, setLibros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    //Use effect para cargar libros, cargamos el loading y busquedas genéricas
    useEffect(() => {
        // Ponemos la carga en true
        setLoading(true);
        // Primero cargamos los libros por defecto con una query
        searchBooksGoogle('brandon sanderson')
            .then(res => {setLibros(res); setPage(1)})
            .catch(err => setError(err.response?.data?.error || err.message))
            .finally(() => setLoading(false))
    }, []);

    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) return;

        setLoading(true);
        setError(null);
        searchBooksGoogle(searchQuery)
            .then(res => setLibros(res))
            .catch(err => setError(err.response?.data?.error || err.message))
            .finally(() => setLoading(false));
    }, [searchQuery])

    const theme = useTheme();
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    // 5 cols × 2 filas en lg+, 3×2 en md, 2×2 en sm, 1×2 en xs
    const librosPorPagina = isLg ? 10 : isMd ? 6 : isSm ? 4 : 2;

    // Columnas fijas de 200px (tamaño exacto de la card) centradas
    const gridCols = isLg ? 'repeat(5, 200px)' : isMd ? 'repeat(3, 200px)' : isSm ? 'repeat(2, 200px)' : 'repeat(1, 200px)';

    const indexUltimoLibro = page * librosPorPagina;
    const indexPrimerLibro = indexUltimoLibro - librosPorPagina;
    const librosActuales = libros.slice(indexPrimerLibro, indexUltimoLibro);
    const totalPaginas = Math.ceil(libros.length / librosPorPagina);


    // Devolvemos el contenedor con el mapeo de cada libro asociado a la bookcard que está en bookcard jsx
   return (
    <PageLayout>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress size={50} />
                    </Box>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

            {/* Grid para libros — columnas fijas de 200px, centrado */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: '32px 48px',
                justifyContent: 'center',
            }}>
                {librosActuales.map((book, index) => (
                    <BookCard key={book.isbn || `book-${index}`} libro={book}/>
                ))}
            </Box>
            {totalPaginas > 1 && (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                        <Pagination
                            count={totalPaginas}
                            page={page}   
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                            size="large" 
                        />
                        
                        </Box>
                    )}
        </PageLayout>
)
}