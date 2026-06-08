import {useState, useEffect, useContext} from "react";
import {Container, Button, CircularProgress, Alert, Box, Typography, IconButton, Tooltip} from "@mui/material";
import {Favorite, FavoriteBorder} from '@mui/icons-material';
import {useLocation, useParams} from "react-router-dom";
import {CreateAnuncioModal} from './CreateAnuncio.jsx';
import {useNavigate} from "react-router-dom";
import {PageLayout} from "../components/PageLayout.jsx";
import {checkFavorito, toggleFavorito} from '../services/favoritoService';
import {AuthContext} from '../context/AuthContext';

export const BookDetail = () => {
    // Estados necesarios para los detalles extendidos del libro
    const [loading, setLoading] = useState(false);
    const [imgSrc, setImgSrc] = useState(undefined);
    const [error, setError] = useState(null);
    const [openCrearAnuncio, setOpenCrearAnuncio] = useState(false);
    const [esFavorito, setEsFavorito] = useState(false);
    const [cargandoFav, setCargandoFav] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const {user} = useContext(AuthContext);

    // Iniciamos el params
    const {id} = useParams();

    const libro = location.state?.libro;

    useEffect(() => {
        if (libro?.portada_url) {
            setImgSrc(libro.portada_url.replace(/zoom=\d+/, 'zoom=2'));
        }
    }, [libro?.portada_url]);

    const handleImgLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        if (naturalWidth === 300 && naturalHeight <= 391) {
            const fallback = libro.portada_url?.replace(/zoom=\d+/, 'zoom=1');
            if (e.target.src !== fallback) setImgSrc(fallback);
        }
    };

    const handleImgError = (e) => {
        const fallback = libro.portada_url?.replace(/zoom=\d+/, 'zoom=1');
        if (e.target.src !== fallback) e.target.src = fallback;
    };

    // Comprobamos si el libro está en favoritos al cargar la página
    useEffect(() => {
        if (user && libro?.isbn) {
            checkFavorito(libro.isbn)
                .then(res => setEsFavorito(res.data.esFavorito))
                .catch(() => {});
        }
    }, [user, libro?.isbn]);

    // Alterna el estado de favorito
    const handleToggleFavorito = async () => {
        if (!user || cargandoFav) return;
        setCargandoFav(true);
        try {
            await toggleFavorito({
                libro_ref: libro.isbn,
                titulo: libro.titulo,
                autor: libro.autor,
                portada_url: libro.portada_url
            });
            setEsFavorito(prev => !prev);
        } catch (err) {
            console.error('Error al guardar favorito:', err);
        } finally {
            setCargandoFav(false);
        }
    };


        if(loading) return <Container><CircularProgress/></Container>
        if(error) return <Container><Alert severity="error">{error}</Alert></Container>
        if(!libro) return null;
        return (
            <PageLayout>
                <Box sx={{
                    maxWidth: {xs: '100%', sm: '95%', md: '1200px'},
                    mx: 'auto',
                    width: '100%',
                    py: {xs: 8, sm: 10},
                    pt: {xs: 2, sm: 2, md: 2, lg: 2, xl: 2}
                }}>
                <Box sx={{display: 'flex', gap: 3, flexDirection: {xs: 'column', md: 'row'}, alignItems: 'flex-start'}}>
                <Box sx={{ flexShrink: 0, width: {xs: '100%', md: 350, lg: 500}}}>
                        <Box
                        component='img'
                        src={imgSrc}
                        alt={libro.titulo}
                        onLoad={handleImgLoad}
                        onError={handleImgError}
                        sx={{width: '100%', height: 'auto', objectFit: 'contain', paddingLeft: {xs: 0, md: '30px', lg: '30px'}}}/>
                        </Box>
                        <Box sx={{flex: 1, minWidth: 0, paddingRight: {xs: 0, md: '80px'}}}>
                        <Typography variant="h4" gutterBottom>{libro.titulo}</Typography>
                        <Typography variant="h6" color='text.secondary' gutterBottom>{libro.autor}</Typography>
                        <Typography variant="body1" paragraph>{libro.sinopsis}</Typography>
                        <Typography variant="body2"><strong>ISBN:</strong>  {libro.isbn}</Typography>
                        <Typography variant="body2"><strong>Year:</strong> {libro.año_publicacion}</Typography>
                        <Typography variant="body2"><strong>Publisher:</strong>{libro.editorial}</Typography>
                        <Box sx={{mt: 3, display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2, alignItems: 'center'}}>
                        {/* Botón de favorito - solo visible si el usuario está autenticado */}
                        {user && (
                            <Tooltip title={esFavorito ? 'Remove from favorites' : 'Add to favorites'}>
                                <IconButton onClick={handleToggleFavorito} disabled={cargandoFav}>
                                    {esFavorito
                                        ? <Favorite sx={{color: '#e53935', fontSize: 28}}/>
                                        : <FavoriteBorder sx={{fontSize: 28}}/>
                                    }
                                </IconButton>
                            </Tooltip>
                        )}
                        {/* Navega a /anuncios filtrado por el ISBN de este libro */}
                        <Button onClick={() => navigate(`/anuncios?isbn=${libro.isbn}`)}>View listings</Button>
                        <Button variant="contained" onClick={() => setOpenCrearAnuncio(true)}>Create listing</Button>
                        <CreateAnuncioModal open={openCrearAnuncio} onClose={() => setOpenCrearAnuncio(false)} libroData={libro}/>
                        </Box>
                        </Box>
                        </Box>
                        </Box>
                        </PageLayout>
        )

}