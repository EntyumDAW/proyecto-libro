import {EjemplarCard} from "../components/EjemplarCard.jsx";
import {traducir} from '../utils/translations.js';
import {CreateEjemplarModal} from "../components/CreateEjemplarModal.jsx";
import {useEffect, useState} from "react";
import {getEjemplares, deleteEjemplar} from "../services/ejemplarService.js";
import {Grid, Alert, Typography, Box, Pagination, useMediaQuery, useTheme, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip} from "@mui/material";
import {PageLayout} from "../components/PageLayout.jsx";
import {Add} from '@mui/icons-material';

export const MisEjemplares = () => {

    const [misEjemplares, setMisEjemplares] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [openCrear, setOpenCrear] = useState(false);
    const [ejemplarSeleccionado, setEjemplarSeleccionado] = useState(null);
    const [openDetalle, setOpenDetalle] = useState(false);

    // Responsive - igual que Home y MisAnuncios
    const theme = useTheme();
    const isXl = useMediaQuery(theme.breakpoints.up('xl'));
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    const ejemplaresPorPagina = isXl ? 12 : isLg ? 8 : isMd ? 6 : isSm ? 4 : 3;

    // Cargar ejemplares del usuario
    useEffect(() => {
        cargarEjemplares();
    }, []);

    // Función para cargar ejemplares
    const cargarEjemplares = () => {
        getEjemplares()
            .then(res => setMisEjemplares(res.data))
            .catch(err => setError(err.response?.data?.error || err.message));
    };

    // Manejador para borrar ejemplar
    const handleBorrar = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await deleteEjemplar(id);
                cargarEjemplares();
                setOpenDetalle(false);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
            }
        }
    };

    // Calcular ejemplares a mostrar
    const indexUltimoEjemplar = page * ejemplaresPorPagina;
    const indexPrimerEjemplar = indexUltimoEjemplar - ejemplaresPorPagina;
    const ejemplaresActuales = misEjemplares.slice(indexPrimerEjemplar, indexUltimoEjemplar);
    const totalPaginas = Math.ceil(misEjemplares.length / ejemplaresPorPagina);

    return (
        <PageLayout>
            <Box sx={{maxWidth: '1600px', mx: 'auto', width: '100%'}}>
                {/* Título y botón crear */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4}}>
                    <Typography variant="h4" sx={{textAlign: 'center', flex: 1}}>
                        My Books
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenCrear(true)}
                        sx={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%)',
                            '&:hover': {background: 'linear-gradient(135deg, #1e40af 0%, #6d28d9 100%)'}
                        }}
                    >
                        Create
                    </Button>
                </Box>

                {/* Grid de ejemplares */}
                <Grid container spacing={3}>
                    {ejemplaresActuales.map(ejemplar => (
                        <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            lg={3} 
                            xl={2.4} 
                            key={ejemplar.id}
                        >
                            <EjemplarCard 
                                ejemplar={ejemplar}
                                onClick={() => {
                                    setEjemplarSeleccionado(ejemplar);
                                    setOpenDetalle(true);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* Paginación */}
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

                {/* Mensaje si no hay ejemplares */}
                {misEjemplares.length === 0 && !error && (
                    <Alert severity="info" sx={{mt: 3}}>
                        You don't have any books yet. Add your first book!
                    </Alert>
                )}

                {/* Error */}
                {error && <Alert severity="error" sx={{mt: 3}}>{error}</Alert>}

                {/* Modal crear ejemplar */}
                <CreateEjemplarModal 
                    open={openCrear}
                    onClose={() => setOpenCrear(false)}
                    onSuccess={cargarEjemplares}
                />

                {/* Modal detalle ejemplar */}
                <Dialog 
                    open={openDetalle} 
                    onClose={() => setOpenDetalle(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    {ejemplarSeleccionado && (
                        <>
                            <DialogTitle sx={{backgroundColor: '#F3DAAF'}}>
                                {ejemplarSeleccionado.libro_id.titulo}
                            </DialogTitle>
                            <DialogContent sx={{backgroundColor: '#F3DAAF', pt: 2}}>
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                    <Box
                                        component='img'
                                        src={ejemplarSeleccionado.libro_id.portada_url}
                                        alt={ejemplarSeleccionado.libro_id.titulo}
                                        sx={{width: '100%', maxHeight: 300, objectFit: 'contain'}}
                                    />
                                    <Typography variant="h6">
                                        {ejemplarSeleccionado.libro_id.autor}
                                    </Typography>
                                    <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                        <Chip label={`${ejemplarSeleccionado.precio}€`} color="primary" />
                                        <Chip label={`Stock: ${ejemplarSeleccionado.stock}`} />
                                        <Chip 
                                            label={traducir(ejemplarSeleccionado.estado)}
                                            color={ejemplarSeleccionado.estado === 'disponible' ? 'success' : 'default'}
                                        />
                                        <Chip label={traducir(ejemplarSeleccionado.condicion)} />
                                    </Box>
                                    {ejemplarSeleccionado.descripcion_estado && (
                                        <Typography variant="body2">
                                            <strong>Description:</strong> {ejemplarSeleccionado.descripcion_estado}
                                        </Typography>
                                    )}
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{backgroundColor: '#F3DAAF'}}>
                                <Button onClick={() => setOpenDetalle(false)}>
                                    Close
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="error"
                                    onClick={() => handleBorrar(ejemplarSeleccionado.id)}
                                >
                                    Delete
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </Box>
        </PageLayout>
    );
};