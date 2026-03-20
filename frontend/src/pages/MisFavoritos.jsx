import { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardMedia, CardContent,
    CardActionArea, IconButton, Alert, Tooltip, Chip
} from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMisFavoritos, toggleFavorito } from '../services/favoritoService';
import { PageLayout } from '../components/PageLayout';

export const MisFavoritos = () => {
    const [favoritos, setFavoritos] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Cargamos los favoritos al montar el componente
    useEffect(() => {
        getMisFavoritos()
            .then(res => setFavoritos(res.data))
            .catch(err => setError(err.response?.data?.error || err.message));
    }, []);

    // Elimina un libro de favoritos y actualiza la lista local
    const handleEliminar = async (libro_ref) => {
        try {
            await toggleFavorito({ libro_ref, titulo: '', autor: '', portada_url: '' });
            setFavoritos(prev => prev.filter(f => f.libro_ref !== libro_ref));
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    return (
        <PageLayout>
            <Box sx={{ maxWidth: '1600px', mx: 'auto', width: '100%' }}>
                <Typography variant="h4" sx={{ my: 4, textAlign: 'center' }}>
                    Mis favoritos
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {favoritos.length === 0 && !error && (
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Favorite sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Aún no tienes libros favoritos
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Marca libros con el corazón para guardarlos aquí
                        </Typography>
                    </Box>
                )}

                {/* Mismo grid que MisEjemplares y MisAnuncios */}
                <Grid container spacing={3}>
                    {favoritos.map(favorito => (
                        <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={favorito.id}>
                            <Card
                                sx={{
                                    height: 390,
                                    width: 200,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                {/* Botón de eliminar favorito */}
                                <Tooltip title="Quitar de favoritos">
                                    <IconButton
                                        onClick={() => handleEliminar(favorito.libro_ref)}
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            zIndex: 1,
                                            bgcolor: 'rgba(255,255,255,0.8)',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                                        }}
                                        size="small"
                                    >
                                        <Favorite sx={{ color: '#e53935', fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>

                                {/* Portada del libro, clickable para ir al detalle */}
                                <CardActionArea
                                    onClick={() => navigate(`/libros/${favorito.libro_ref}`, {
                                        state: {
                                            libro: {
                                                isbn: favorito.libro_ref,
                                                titulo: favorito.titulo,
                                                autor: favorito.autor,
                                                portada_url: favorito.portada_url,
                                                sinopsis: '',
                                                editorial: '',
                                                año_publicacion: ''
                                            }
                                        }
                                    })}
                                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={favorito.portada_url}
                                        alt={favorito.titulo}
                                        sx={{ height: 280, objectFit: 'cover' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, py: 1, overflow: 'hidden', backgroundColor: '#fae8caff' }}>
                                        <Typography variant="h6" component="div" noWrap>
                                            {favorito.titulo}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {favorito.autor}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </PageLayout>
    );
};
