import {useContext, useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Container, Grid, Box, Typography, Chip, Divider, Button, 
    CircularProgress, Alert, List, ListItem, ListItemText, Paper
} from '@mui/material';
import {getAnuncioDetail, deleteAnuncio} from '../services/anuncioService.js';
import {iniciarConversacion} from '../services/mensajeService.js';
import {SolicitarTransaccionModal} from '../components/SolicitarTransaccionModal.jsx';
import {TransaccionSection} from '../components/TransaccionSection.jsx';
import {AuthContext} from '../context/AuthContext.jsx';
import {PageLayout} from '../components/PageLayout.jsx';
import {traducir} from '../utils/translations.js';

export const AnuncioDetail = () => {

    // Extraer id de la URL
    const {id} = useParams();
    const navigate = useNavigate();
    
    // Obtener usuario del contexto de autenticación
    const {user} = useContext(AuthContext);
    const usuarioId = user?.id;

    // Estados
    const [anuncio, setAnuncio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSolicitar, setOpenSolicitar] = useState(false);
    const [iniciandoChat, setIniciandoChat] = useState(false);

    // Cargar anuncio al montar o cuando cambie el id
    useEffect(() => {
        const loadAnuncio = async () => {
            try {
                setLoading(true);
                const res = await getAnuncioDetail(id);
                setAnuncio(res.data);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
        loadAnuncio();
    }, [id]);

    // Inicia o recupera la conversación con el vendedor y navega al chat
    const handleContactar = async () => {
        if (!user || iniciandoChat) return;
        setIniciandoChat(true);
        try {
            const res = await iniciarConversacion(anuncio.usuario_id.id);
            navigate(`/mensajes/${res.data.id}`);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setIniciandoChat(false);
        }
    };

    // borrar anuncio
    const handleBorrar = async () => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await deleteAnuncio(id);
                navigate('/mis-anuncios');
            } catch (err) {
                alert(err.response?.data?.error || err.message);
            }
        }
    };

    // formatear fechas
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('en-US');
    };

    // Renderizado mientras carga
    if (loading) {
        return (
            <Container sx={{display: 'flex', justifyContent: 'center', mt: 5}}>
                <CircularProgress />
            </Container>
        );
    }

    // Renderizado si hay error
    if (error) {
        return (
            <Container sx={{mt: 5}}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    // Renderizado si no existe el anuncio
    if (!anuncio) {
        return (
            <Container sx={{mt: 5}}>
                <Alert severity="warning">Listing not found</Alert>
            </Container>
        );
    }

    const libro = anuncio.ejemplar_id.libro_id || anuncio.libro_id;
    const esPeticion = anuncio.tipo === 'peticion';


    // derivados
    const esMiAnuncio = usuarioId === anuncio?.usuario;
    const tieneTransaccion = anuncio?.transacciones?.length > 0;
    const transaccionActiva = anuncio?.transacciones?.find(
        t => t.estado === 'pendiente' || t.estado === 'aceptada'
    );

    return (
        <PageLayout>
            <Box sx={{
                maxWidth: {xs: '100%', sm: '95%', md: '1200px'}, 
                mx: 'auto', 
                width: '100%', 
                py: {xs: 13, sm: 13, md: 18},
                pt: {xs: 2, sm: 2, md: 2, lg: 2, xl: 2}
            }}>         
            <Paper elevation={3} sx={{p: 3, mb: 3, backgroundColor: '#fae8caff'}}>
                <Box sx={{display: 'flex', gap: 3, flexDirection: {xs: 'column', md: 'row'}, alignItems: 'flex-start'}}>
                    <Box sx={{ flexShrink: 0, width: {xs: '100%', md: 350, lg: 500}}}>
                        <Box
                            component="img"
                            src={anuncio.ejemplar_id.libro_id.portada_url.replace(/zoom=\d/, 'zoom=3')}
                            alt={anuncio.ejemplar_id.libro_id.titulo}
                            sx={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                paddingLeft: {xs: 0, md: '20px', lg: '30px'}
                            }}
                        />
                    </Box>

                    <Box sx={{flex: 1, minWidth: 0, paddingRight: {xs: 0, md: '80px'}}}>
                        <Typography variant="h4" gutterBottom>
                            {anuncio.ejemplar_id.libro_id.titulo}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {anuncio.ejemplar_id.libro_id.autor}
                        </Typography>
                        <Typography variant="body1" paragraph sx={{mt: 2}}>
                            {anuncio.ejemplar_id.libro_id.sinopsis}
                        </Typography>
                        <Typography variant="body2">
                            <strong>ISBN:</strong> {anuncio.ejemplar_id.libro_id.isbn}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Year:</strong> {anuncio.ejemplar_id.libro_id.año_publicacion}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Publisher:</strong> {anuncio.ejemplar_id.libro_id.editorial}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Divider sx={{my: 3}} />

            <Paper elevation={3} sx={{p: 3, mb: 3, backgroundColor: '#fae8caff'}}>
                <Typography variant="h5" gutterBottom>Listing details</Typography>
                <Typography variant="h6" sx={{mt: 2}}>{anuncio.titulo}</Typography>
                <Typography variant="body1" paragraph>{anuncio.descripcion}</Typography>
                
                <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                    <Chip label={traducir(anuncio.tipo)} color="primary" />
                    <Chip label={traducir(anuncio.estado)} color={anuncio.estado === 'activo' ? 'success' : 'default'} />
                </Box>

                <Typography variant="body2">
                    <strong>Expiration date:</strong> {formatearFecha(anuncio.fecha_expiracion)}
                </Typography>
                
                {anuncio.lugar_recogida && (
                    <Typography variant="body2">
                        <strong>Pickup city:</strong> {anuncio.lugar_recogida}
                    </Typography>
                )}

                {anuncio.permite_envio && (
                    <>
                        <Chip label="Shipping available" color="info" sx={{mt: 1}} />
                        {anuncio.precio_envio && (
                            <Typography variant="body2" sx={{mt: 1}}>
                                <strong>Shipping price:</strong> {anuncio.precio_envio}€
                            </Typography>
                        )}
                    </>
                )}

                {anuncio.metodo_pago && (
                    <Typography variant="body2" sx={{mt: 1}}>
                        <strong>Payment method:</strong> {anuncio.metodo_pago}
                    </Typography>
                )}
            </Paper>

            <Divider sx={{my: 3}} />

            <Paper elevation={3} sx={{p: 3, mb: 3, backgroundColor: '#fae8caff'}}>
                <Typography variant="h5" gutterBottom>Book condition</Typography>
                <Typography variant="body1" sx={{mt: 2}}>
                    <strong>Price:</strong> {anuncio.ejemplar_id.precio}€
                </Typography>
                <Typography variant="body1">
                    <strong>Stock:</strong> {anuncio.ejemplar_id.stock}
                </Typography>
                <Box sx={{display: 'flex', gap: 1, mt: 2}}>
                    <Chip label={traducir(anuncio.ejemplar_id.condicion)} />
                    <Chip label={traducir(anuncio.ejemplar_id.estado)} color="success" />
                </Box>
                <Typography variant="body2" sx={{mt: 2}}>
                    <strong>Condition details:</strong> {anuncio.ejemplar_id.descripcion_estado}
                </Typography>
            </Paper>

            <Divider sx={{my: 3}} />

            {anuncio.tipo === 'intercambio' && anuncio.intercambio_deseado?.length > 0 && (
                <>
                    <Paper elevation={3} sx={{p: 3, mb: 3, backgroundColor: '#fae8caff'}}>
                        <Typography variant="h5" gutterBottom>
                            Books accepted for exchange
                        </Typography>
                        <List>
                            {anuncio.intercambio_deseado.map(ic => (
                                <ListItem key={ic.libro_deseado}>
                                    <ListItemText 
                                        primary={ic.libro.titulo}
                                        secondary={ic.libro.autor}
                                        />
                                </ListItem>
                            ))}
                        </List>
                        {anuncio.acepta_otros && (
                            <Chip label="Also accepts other books" color="info" sx={{mt: 1}} />
                        )}
                    </Paper>
                    <Divider sx={{my: 3}} />
                </>
            )}

            <Paper elevation={3} sx={{p: 3, mb: 3, backgroundColor: '#fae8caff'}}>
                <Typography variant="h5" gutterBottom>Seller information</Typography>
                <Typography variant="body1">
                    <strong>Username:</strong> {anuncio.usuario_id.nombre_usuario}
                </Typography>
                <Typography variant="body1">
                    <strong>Location:</strong> {anuncio.usuario_id.ciudad}, {anuncio.usuario_id.provincia}
                </Typography>
            </Paper>

            <Divider sx={{my: 3}} />

            <Box sx={{display: 'flex', gap: 2, mb: 3}}>
                {esMiAnuncio && (
                    <>
                        <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={handleBorrar}
                            >
                            Delete listing
                        </Button>
                    </>
                )}

                {!esMiAnuncio && anuncio.estado === 'activo' && !transaccionActiva && (
                    <Button
                    variant="contained"
                    size="large"
                    onClick={() => setOpenSolicitar(true)}
                    >
                        Request
                    </Button>
                )}

                {/* Botón para contactar con el vendedor por mensajes - solo si estás autenticado y no es tu propio anuncio */}
                {user && !esMiAnuncio && (
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={handleContactar}
                        disabled={iniciandoChat}
                    >
                        {iniciandoChat ? 'Opening chat...' : 'Message seller'}
                    </Button>
                )}
            </Box>

            {tieneTransaccion && transaccionActiva && (
                <TransaccionSection 
                transaccion={transaccionActiva} 
                usuarioId={usuarioId}
                />
            )}

            <SolicitarTransaccionModal 
                open={openSolicitar}
                onClose={() => setOpenSolicitar(false)}
                anuncio={anuncio}
                />
            </Box>   
        </PageLayout>
    );
};