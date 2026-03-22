import {AnuncioCard} from "../components/AnuncioCard.jsx";
import {useEffect, useState, useContext} from "react";
import {useSearchParams} from "react-router-dom";
import {getAllAnuncios} from "../services/anuncioService.js";
import {Alert, Typography, Box, Select, TextField, FormControl, InputLabel, MenuItem, Pagination} from "@mui/material";
import {PageLayout} from "../components/PageLayout.jsx";
import {AuthContext} from '../context/AuthContext';


export const Anuncios = () => {

    const [anuncios, setAnuncios] = useState([]);
    const [error, setError] = useState(null);
    const {user} = useContext(AuthContext);

    // Leemos el parámetro isbn de la URL (viene desde BookDetail al pulsar "View listings")
    const [searchParams] = useSearchParams();
    const isbnParam = searchParams.get('isbn');

    // Inicializamos los filtros con el isbn si viene en la URL
    const [filtros, setFiltros] = useState({ isbn: isbnParam || null });
    const [page, setPage] = useState(1);
    const ITEMS_POR_PAGINA = 8;

    useEffect(() => {
        setPage(1);
        getAllAnuncios({...filtros, estado: 'activo'})
            .then(res => {
                const anunciosFiltrados = res.data.filter(anuncio => {
                    // Ocultamos los anuncios propios (el usuario ya los ve en "Mis anuncios")
                    if (user && anuncio.usuario === user.id) return false;
                    // Ocultamos los que ya tienen transacción aceptada o completada
                    if (!anuncio.transacciones || anuncio.transacciones.length === 0) return true;
                    const tieneAceptadaOCompletada = anuncio.transacciones.some(
                        t => t.estado === 'aceptada' || t.estado === 'completada'
                    );
                    return !tieneAceptadaOCompletada;
                });
                setAnuncios(anunciosFiltrados);
            })
            .catch(err => setError(err.response?.data?.error || err.message))

    }, [filtros])

    return (
        <PageLayout>
            <Box sx={{maxWidth: '1600px', mx: 'auto', width: '100%'}}>
            <Typography variant="h4" sx={{my: 4, textAlign: 'center'}}>Listings</Typography>
            <Box sx={{
                mb: 3, 
                display: 'flex',
                flexDirection: {xs: 'column', sm: 'row'},
                gap: 2
                }}>
                <FormControl sx={{minWidth: {xs: '100%', sm: 200}}}>
                    <InputLabel>Type</InputLabel>
                <Select label='Tipo' value={filtros.tipo || ''} onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}>
                    <MenuItem value=''>All</MenuItem>
                    <MenuItem value='venta'>Sale</MenuItem>
                    <MenuItem value='intercambio'>Exchange</MenuItem>
                    </Select>
                </FormControl>
                    <TextField sx={{minWidth: {xs: '100%', sm: 300}}} label='Author/Title' onChange={(e) => setFiltros({...filtros, search: e.target.value})}/>
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(1, 200px)',
                    sm: 'repeat(2, 200px)',
                    md: 'repeat(4, 200px)',
                },
                gap: 3,
                justifyContent: 'flex-start',
            }}>
                {anuncios
                    .slice((page - 1) * ITEMS_POR_PAGINA, page * ITEMS_POR_PAGINA)
                    .map(anuncio => (
                        <AnuncioCard key={anuncio.id} anuncio={anuncio}/>
                    ))}
            </Box>

            {Math.ceil(anuncios.length / ITEMS_POR_PAGINA) > 1 && (
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 6, mb: 4}}>
                    <Pagination
                        count={Math.ceil(anuncios.length / ITEMS_POR_PAGINA)}
                        page={page}
                        onChange={(e, value) => { setPage(value); window.scrollTo(0, 0); }}
                        color="primary"
                        size="large"
                    />
                </Box>
            )}

            {/* Mensaje vacío cuando hay filtro ISBN activo y no hay resultados */}
            {anuncios.length === 0 && !error && filtros.isbn && (
                <Alert severity="info" sx={{mt: 2}}>
                    No listings available for this book at the moment.
                </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
        </PageLayout>
    )

}