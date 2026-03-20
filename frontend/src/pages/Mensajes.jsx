import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, List, ListItem, ListItemAvatar, ListItemText,
    Avatar, Divider, Alert, CircularProgress, Chip, Paper
} from '@mui/material';
import { Chat } from '@mui/icons-material';
import { getMisConversaciones } from '../services/mensajeService';
import { PageLayout } from '../components/PageLayout';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const Mensajes = () => {
    const [conversaciones, setConversaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Cargamos las conversaciones al montar el componente
    useEffect(() => {
        getMisConversaciones()
            .then(res => setConversaciones(res.data))
            .catch(err => setError(err.response?.data?.error || err.message))
            .finally(() => setLoading(false));
    }, []);

    // Formateamos la fecha del último mensaje
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const ahora = new Date();
        const fecha_msg = new Date(fecha);
        const diffMs = ahora - fecha_msg;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDias = Math.floor(diffHoras / 24);

        if (diffHoras < 1) return 'Ahora';
        if (diffHoras < 24) return `Hace ${diffHoras}h`;
        if (diffDias < 7) return `Hace ${diffDias}d`;
        return fecha_msg.toLocaleDateString('es-ES');
    };

    // Determina el otro usuario en la conversación (no el autenticado)
    const getOtroUsuario = (conv) => {
        return conv.usuario1_id.id === user?.id ? conv.usuario2_id : conv.usuario1_id;
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
            <Box sx={{ maxWidth: 700, mx: 'auto', width: '100%', py: 4 }}>
                <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
                    Mensajes
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {conversaciones.length === 0 && !error && (
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Chat sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No tienes conversaciones aún
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Contacta con un vendedor desde el detalle de un anuncio
                        </Typography>
                    </Box>
                )}

                <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#fae8caff' }}>
                    <List disablePadding>
                        {conversaciones.map((conv, index) => {
                            const otroUsuario = getOtroUsuario(conv);
                            const ultimoMsg = conv.mensajes?.[0];

                            return (
                                <Box key={conv.id}>
                                    <ListItem
                                        alignItems="flex-start"
                                        onClick={() => navigate(`/mensajes/${conv.id}`)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'rgba(180,142,102,0.2)' },
                                            py: 2
                                        }}
                                    >
                                        {/* Avatar con inicial del otro usuario */}
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>
                                                {otroUsuario.nombre_usuario?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>

                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography fontWeight="bold">
                                                        {otroUsuario.nombre_usuario}
                                                    </Typography>
                                                    {ultimoMsg && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatearFecha(ultimoMsg.fecha)}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                    sx={{ maxWidth: 400 }}
                                                >
                                                    {ultimoMsg
                                                        ? (ultimoMsg.remitente === user?.id ? 'Tú: ' : '') + ultimoMsg.contenido
                                                        : 'Conversación nueva'
                                                    }
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    {index < conversaciones.length - 1 && <Divider />}
                                </Box>
                            );
                        })}
                    </List>
                </Paper>
            </Box>
        </PageLayout>
    );
};
