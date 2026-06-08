import {useState, useEffect, useContext} from "react";
import {CardMedia, Card, Typography, CardContent, CardActionArea, DialogContent, DialogActions, Button, Dialog, Box, Grid, IconButton, Tooltip} from '@mui/material';
import {Favorite, FavoriteBorder} from '@mui/icons-material';
import {useNavigate} from "react-router-dom";
import {checkFavorito, toggleFavorito} from '../services/favoritoService';
import {AuthContext} from '../context/AuthContext';

export const BookCard = ({libro}) => {
    // Estado para el modal y para el favorito
    const [open, setOpen] = useState(false);
    const [esFavorito, setEsFavorito] = useState(false);
    const [cargandoFav, setCargandoFav] = useState(false);
    const [imgSrc, setImgSrc] = useState(libro.portada_url);

    // Si la imagen cargada es 300x391 es el placeholder gris de Google → zoom=1
    const handleImgLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        if (naturalWidth === 300 && naturalHeight <= 391) {
            const fallback = e.target.src.replace(/zoom=\d+/, 'zoom=1');
            if (e.target.src !== fallback) setImgSrc(fallback);
        }
    };

    // Si la imagen falla (error de red), cae a zoom=1 como último recurso
    const handleImgError = () => {
        const fallback = libro.portada_url?.replace(/zoom=\d+/, 'zoom=1');
        if (imgSrc !== fallback) setImgSrc(fallback);
        else setImgSrc(null);
    };

    const navigate = useNavigate();
    const {user} = useContext(AuthContext);

    // Comprobamos si el libro está en favoritos al abrir el modal
    useEffect(() => {
        if (open && user && libro.isbn) {
            checkFavorito(libro.isbn)
                .then(res => setEsFavorito(res.data.esFavorito))
                .catch(() => {});
        }
    }, [open, user, libro.isbn]);

    // Alterna el estado de favorito
    const handleToggleFavorito = async (e) => {
        e.stopPropagation();
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


    // Devolvemos las card para los libros y expandidas haciendo click con la sinopsis, año, editorial, etc... Con botones para seleccionarlo o volver
return (
    <>
        <Card sx={{height: 350, display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#fae8caff'}}>
            <CardActionArea onClick={() => setOpen(true)} sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch'}}>
                {imgSrc && (
                    <Box
                        component='img'
                        src={imgSrc}
                        alt={libro.titulo}
                        onLoad={handleImgLoad}
                        onError={handleImgError}
                        sx={{
                            height: 280,
                            width: '100%',
                            objectFit: 'cover',
                            flexShrink: 0,
                            display: 'block'
                        }}
                    />
                )}
                <CardContent sx={{width: 180, overflow: 'hidden', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Typography variant="h6" component='div' noWrap>
                        {libro.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {libro.autor}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
        
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth='lg' fullWidth>
            <DialogContent sx={{backgroundColor: '#F3DAAE'}}>
                <Box sx={{display: 'flex', gap: 3, flexDirection: 'row', alignItems: 'flex-start'}}>
                    <Box sx={{ flexShrink: 0, width: 400}}>
                        <Box
                            component='img'
                            sx={{width: '100%', height: 'auto', objectFit: 'contain'}}
                            src={imgSrc || libro.portada_url}
                            alt={libro.titulo}
                        />
                    </Box>
                    <Box sx={{flex: 1, minWidth: 0}}>
                        <Typography variant="h4" gutterBottom>{libro.titulo}</Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>{libro.autor}</Typography>
                        <Typography variant="body1" sx={{maxHeight: 300, overflow: 'auto', mt: 2}} paragraph>
                            {libro.sinopsis}
                        </Typography>
                        <Typography variant="body2"><strong>ISBN:</strong> {libro.isbn}</Typography>
                        <Typography variant="body2"><strong>Year:</strong> {libro.año_publicacion}</Typography>
                        <Typography variant="body2"><strong>Publisher:</strong> {libro.editorial}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{backgroundColor: '#F3DAAE', justifyContent: 'space-between'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Button onClick={() => setOpen(false)}>Back</Button>
                    {/* Botón de favorito - solo visible si el usuario está autenticado */}
                    {user && (
                        <Tooltip title={esFavorito ? 'Remove from favorites' : 'Add to favorites'}>
                            <IconButton onClick={handleToggleFavorito} disabled={cargandoFav} size="small">
                                {esFavorito
                                    ? <Favorite sx={{color: '#e53935'}}/>
                                    : <FavoriteBorder/>
                                }
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                <Button variant="contained" onClick={() => navigate(`/libros/${libro.isbn}`, {state: {libro}})}>Choose</Button>
            </DialogActions>
        </Dialog>
    </>
)
}