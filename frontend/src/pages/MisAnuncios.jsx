import {AnuncioCard} from "../components/AnuncioCard.jsx";
import {useEffect, useState} from "react";
import {getMisAnuncios} from "../services/anuncioService.js";
import {Grid, Alert, Typography, Box, Pagination, useMediaQuery, useTheme} from "@mui/material";
import {PageLayout} from "../components/PageLayout.jsx";


export const MisAnuncios = () => {

    const [misAnuncios, setMisAnuncios] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    const theme = useTheme();
    const isXl = useMediaQuery(theme.breakpoints.up('xl'));
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    const anunciosPorPagina = isXl ? 12 : isLg ? 8 : isMd ? 6 : isSm ? 4 : 3;

    useEffect(() => {
        getMisAnuncios()
            .then(res => setMisAnuncios(res.data))
            .catch(err => setError(err.response?.data?.error || err.message))

    }, [])

    const indexUltimoAnuncio = page * anunciosPorPagina;
    const indexPrimerAnuncio = indexUltimoAnuncio - anunciosPorPagina;
    const anunciosActuales = misAnuncios.slice(indexPrimerAnuncio, indexUltimoAnuncio);
    const totalPaginas = Math.ceil(misAnuncios.length / anunciosPorPagina);

    return (
        <PageLayout>
            <Box sx={{maxWidth: '1600px', mx: 'auto', width: '100%'}}>
            <Typography variant="h4" sx={{my: 4, textAlign: 'center'}}>My Listings</Typography>
            <Grid container spacing={3} sx={{width: '100%'}}>
        {anunciosActuales.map(anuncio =>(
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={anuncio.id}>
                <AnuncioCard anuncio={anuncio}/>
                </Grid> 
        ))}
        </Grid>

        {totalPaginas > 1 && (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 6, mb: 4}}>
                <Pagination
                    count={totalPaginas}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    size="large"
                />
            </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}
        </Box>
        </PageLayout>
    )

}