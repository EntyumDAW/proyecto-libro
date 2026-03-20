import {useState} from 'react';
import {Card, CardContent, Typography, Chip, Divider, Button, Box, Snackbar, Alert} from '@mui/material';
import {aceptarTransaccion, cancelarTransaccion, completarTransaccion} from '../services/transaccionService.js';
import {useNavigate} from 'react-router-dom';
import {traducir} from '../utils/translations.js';

export const TransaccionSection = ({transaccion, usuarioId}) => {

    const navigate = useNavigate();
    
    const [mensaje, setMensaje] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const esOferente = usuarioId === transaccion.oferente;
    const esSolicitante = usuarioId === transaccion.solicitante;

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getColorEstado = (estado) => {
        switch(estado) {
            case 'pendiente': return 'warning';
            case 'aceptada': return 'info';
            case 'completada': return 'success';
            case 'rechazada': return 'error';
            case 'cancelada': return 'default';
            default: return 'default';
        }
    };

    const handleAceptar = async () => {
        try {
            setLoading(true);
            await aceptarTransaccion(transaccion.id);
            setMensaje('Transaction accepted successfully');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async () => {
        try {
            setLoading(true);
            await cancelarTransaccion(transaccion.id);
            setMensaje('Transaction cancelled');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompletar = async () => {
        try {
            setLoading(true);
            await completarTransaccion(transaccion.id);
            setMensaje('Transaction completed successfully');
            setTimeout(() => navigate('/mis-anuncios'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card sx={{mt: 3, p: 2, backgroundColor: '#FAE8CA'}}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Transaction status</Typography>
                    <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                        <Chip 
                            label={traducir(transaccion.estado)} 
                            color={getColorEstado(transaccion.estado)}
                        />
                        <Chip label={`Type: ${traducir(transaccion.tipo)}`} />
                    </Box>
                    {transaccion.tipo === 'venta' && transaccion.precio_acordado && (
                        <Typography variant="body1" sx={{mb: 2}}>
                            Agreed price: {transaccion.precio_acordado}€
                        </Typography>
                    )}
                    
                    <Divider sx={{my: 2}} />

                    <Typography variant="h6" gutterBottom>Participants</Typography>
                    <Typography variant="body2">
                        Seller: {transaccion.oferente_id.nombre_usuario}
                    </Typography>
                    <Typography variant="body2" sx={{mb: 2}}>
                        Buyer: {transaccion.solicitante_id.nombre_usuario}
                    </Typography>

                    <Divider sx={{my: 2}} />

                    <Typography variant="h6" gutterBottom>Books involved</Typography>
                    <Typography variant="body2">
                        Requested book: {transaccion.ejemplar_solicita.libro_id.titulo}
                    </Typography>
                    {transaccion.ejemplar_ofrece && (
                        <Typography variant="body2" sx={{mb: 2}}>
                            Offered book: {transaccion.ejemplar_ofrece.libro_id.titulo}
                        </Typography>
                    )}

                    <Divider sx={{my: 2}} />

                    <Typography variant="h6" gutterBottom>Dates</Typography>
                    <Typography variant="body2">
                        Created: {formatearFecha(transaccion.fecha_creacion)}
                    </Typography>
                    <Typography variant="body2" sx={{mb: 2}}>
                        Last updated: {formatearFecha(transaccion.fecha_actualizacion)}
                    </Typography>

                    <Divider sx={{my: 2}} />

                    {/* Sección de confirmaciones cuando la transacción está aceptada */}
                    {transaccion.estado === 'aceptada' && (
                        <>
                            <Divider sx={{my: 2}} />
                            <Typography variant="h6" gutterBottom>Confirmations</Typography>
                            <Typography variant="body2" sx={{
                                color: transaccion.confirmado_oferente ? 'success.main' : 'text.secondary'
                            }}>
                                 Seller ({transaccion.oferente_id.nombre_usuario}): {transaccion.confirmado_oferente ? 'Confirmed' : 'Pending'}
                            </Typography>
                            <Typography variant="body2" sx={{
                                mb: 2,
                                color: transaccion.confirmado_solicitante ? 'success.main' : 'text.secondary'
                            }}>
                                 Buyer ({transaccion.solicitante_id.nombre_usuario}): {transaccion.confirmado_solicitante ? 'Confirmed' : 'Pending'}
                            </Typography>
                        </>
                    )}

                    <Box sx={{display: 'flex', gap: 2, mt: 3}}>
                        {/* El vendedor acepta o rechaza cuando está pendiente */}
                        {esOferente && transaccion.estado === 'pendiente' && (
                            <>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleAceptar}
                                    disabled={loading}
                                >
                                    Accept
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleCancelar}
                                    disabled={loading}
                                >
                                    Reject
                                </Button>
                            </>
                        )}

                        {/* Cuando está aceptada, cada parte puede confirmar su parte */}
                        {transaccion.estado === 'aceptada' && (esOferente || esSolicitante) && (
                            <>
                                {/* Botón de confirmar — solo visible si el usuario aún no ha confirmado */}
                                {((esOferente && !transaccion.confirmado_oferente) ||
                                  (esSolicitante && !transaccion.confirmado_solicitante)) && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleCompletar}
                                        disabled={loading}
                                    >
                                        Confirm completion
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    onClick={handleCancelar}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}

                        {/* El solicitante puede cancelar su propia solicitud mientras está pendiente */}
                        {esSolicitante && transaccion.estado === 'pendiente' && (
                            <Button
                                variant="outlined"
                                onClick={handleCancelar}
                                disabled={loading}
                            >
                                Cancel request
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* success messages */}
            <Snackbar 
                open={!!mensaje} 
                autoHideDuration={3000} 
                onClose={() => setMensaje(null)}
            >
                <Alert severity="success">{mensaje}</Alert>
            </Snackbar>

            {/* errors */}
            <Snackbar 
                open={!!error} 
                autoHideDuration={3000} 
                onClose={() => setError(null)}
            >
                <Alert severity="error">{error}</Alert>
            </Snackbar>
        </>
    );
};