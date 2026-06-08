import { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, IconButton, Paper, Avatar,
    CircularProgress, Alert, Divider
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import { getMensajes, enviarMensaje } from '../services/mensajeService';
import { AuthContext } from '../context/AuthContext';
import { PageLayout } from '../components/PageLayout';

export const Conversacion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [mensajes, setMensajes] = useState([]);
    const [otroUsuario, setOtroUsuario] = useState(null);
    const [texto, setTexto] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);

    // Referencia para hacer scroll automático al último mensaje
    const bottomRef = useRef(null);

    // Carga los mensajes de la conversación
    const cargarMensajes = async () => {
        try {
            const res = await getMensajes(Number(id));
            setMensajes(res.data);

            // Determinamos el otro usuario a partir del primer mensaje que no sea nuestro
            const msgAjeno = res.data.find(m => m.remitente !== user?.id);
            if (msgAjeno) setOtroUsuario(msgAjeno.remitente_id);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cargamos al montar y refrescamos cada 5 segundos para simular tiempo real
    useEffect(() => {
        cargarMensajes();
        const intervalo = setInterval(cargarMensajes, 5000);
        return () => clearInterval(intervalo);
    }, [id]);

    // Scroll automático al llegar nuevos mensajes
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    // Envía el mensaje y limpia el input
    const handleEnviar = async () => {
        if (!texto.trim() || enviando) return;
        setEnviando(true);
        try {
            const res = await enviarMensaje(Number(id), texto.trim());
            setMensajes(prev => [...prev, res.data]);
            setTexto('');
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setEnviando(false);
        }
    };

    // Permite enviar con Enter (sin Shift)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEnviar();
        }
    };

    // Formatea la hora del mensaje
    const formatearHora = (fecha) => {
        return new Date(fecha).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Agrupa los mensajes por fecha para mostrar separadores de día
    const formatearFechaSeparador = (fecha) => {
        return new Date(fecha).toLocaleDateString('en-US', {
            weekday: 'long', day: 'numeric', month: 'long'
        });
    };

    if (loading) {
        return (
            <PageLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Box sx={{ maxWidth: 700, mx: 'auto', width: '100%', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

                {/* Cabecera de la conversación */}
                <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: '12px 12px 0 0', bgcolor: '#F3DAAE' }}>
                    <IconButton onClick={() => navigate('/mensajes')} size="small">
                        <ArrowBack />
                    </IconButton>
                    {otroUsuario && (
                        <>
                            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>
                                {otroUsuario.nombre_usuario?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography fontWeight="bold">
                                {otroUsuario.nombre_usuario}
                            </Typography>
                        </>
                    )}
                    {!otroUsuario && (
                        <Typography fontWeight="bold" color="text.secondary">
                            New conversation
                        </Typography>
                    )}
                </Paper>

                {error && <Alert severity="error" sx={{ mx: 0 }}>{error}</Alert>}

                {/* Lista de mensajes con scroll — fondo igual que las cards y secciones de la app */}
                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        bgcolor: '#fae8ca'
                    }}
                >
                    {mensajes.length === 0 && (
                        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
                            Be the first to write a message
                        </Typography>
                    )}

                    {mensajes.map((msg, index) => {
                        const esMio = msg.remitente === user?.id;

                        // Mostramos separador de fecha cuando cambia el día
                        const fechaActual = new Date(msg.fecha).toDateString();
                        const fechaAnterior = index > 0 ? new Date(mensajes[index - 1].fecha).toDateString() : null;
                        const mostrarSeparadorFecha = fechaActual !== fechaAnterior;

                        return (
                            <Box key={msg.id}>
                                {/* Separador de fecha */}
                                {mostrarSeparadorFecha && (
                                    <Box sx={{ textAlign: 'center', my: 2 }}>
                                        <Typography variant="caption" sx={{ bgcolor: 'rgba(180,142,102,0.3)', color: '#5c3d1e', px: 2, py: 0.5, borderRadius: 10 }}>
                                            {formatearFechaSeparador(msg.fecha)}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Burbuja del mensaje */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: esMio ? 'flex-end' : 'flex-start',
                                        mb: 0.5
                                    }}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: '70%',
                                            // Mis mensajes: marrón primario de la app; los del otro: crema igual que los paneles
                                            bgcolor: esMio ? '#B48E66' : '#F3DAAE',
                                            color: esMio ? '#fff' : '#3e2a10',
                                            px: 2,
                                            py: 1,
                                            borderRadius: esMio
                                                ? '18px 18px 4px 18px'
                                                : '18px 18px 18px 4px',
                                            boxShadow: '0 1px 3px rgba(120,80,30,0.15)'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                            {msg.contenido}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                textAlign: 'right',
                                                mt: 0.5,
                                                opacity: 0.75
                                            }}
                                        >
                                            {formatearHora(msg.fecha)}
                                            {esMio && (msg.leido ? ' ✓✓' : ' ✓')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}

                    {/* Ancla para el scroll automático */}
                    <div ref={bottomRef} />
                </Box>

                {/* Input para escribir el mensaje */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-end',
                        borderRadius: '0 0 12px 12px',
                        bgcolor: '#F3DAAE'
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        size="small"
                        placeholder="Escribe un mensaje..."
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        onKeyDown={handleKeyDown}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                bgcolor: '#fdf6ec',
                                '& fieldset': { borderColor: '#c8a87a' },
                                '&:hover fieldset': { borderColor: '#B48E66' },
                                '&.Mui-focused fieldset': { borderColor: '#B48E66' }
                            }
                        }}
                    />
                    <IconButton
                        onClick={handleEnviar}
                        disabled={!texto.trim() || enviando}
                        sx={{
                            bgcolor: 'primary.main',
                            color: '#fff',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&:disabled': { bgcolor: 'action.disabledBackground' }
                        }}
                    >
                        <Send />
                    </IconButton>
                </Paper>
            </Box>
        </PageLayout>
    );
};
