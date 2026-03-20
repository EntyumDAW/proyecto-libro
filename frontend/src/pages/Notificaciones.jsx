import {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {getMisNotificaciones, markAllRead, markAsRead} from "../services/notificacionService.js";
import {Alert, Button, CircularProgress, List, ListItem, ListItemText, Typography, Box} from "@mui/material";
import {PageLayout} from "../components/PageLayout.jsx";

export const Notificaciones = () => {

    const navigate = useNavigate();

    // Estados necesarios
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
            getMisNotificaciones()
                .then(res => setNotificaciones(res.data))
                .catch(err => setError(err.response?.data?.error || err.message))
                .finally(() => setLoading(false))
        }, [])

        const handleClick = async (notificacion) => {
            if (!notificacion.leida) {
                await markAsRead(notificacion.id);
                setNotificaciones(notificaciones.map(n => 
                    n.id === notificacion.id ? {...n, leida: true} : n
                ));
            }
            navigate(notificacion.enlace);
        }

        const handleMarcarTodasLeidas = async () => {
            await markAllRead()
            setNotificaciones(notificaciones.map(n => ({...n, leida: true})))
        }

        // validaciones
        if (loading) return <PageLayout><Box sx={{ backgroundColor: '#F3DAAE', p: 3 }}><CircularProgress/></Box></PageLayout>;
        if (error) return <PageLayout><Box sx={{ backgroundColor: '#F3DAAE', p: 3 }}><Alert severity="error">{error}</Alert></Box></PageLayout>;
        if (!notificaciones.length) return (
        <PageLayout>
            <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'}}>
                <Alert severity="info"
                    sx={{
                        backgroundColor: '#fae8caff',
                        border: '1px solid #fae8caff'
                        }}>No notifications</Alert></Box></PageLayout>
                    )

        return (
            <PageLayout>
            <Box sx={{
                backgroundColor: '#F3DAAE',
                p: 3,
                borderRadius: 2,
                maxWidth: '800px',
                mx: 'auto',
                minHeight: 'calc(100vh - 300px',
                width: '100%'
                }}>

            <Typography variant="h4" sx={{mb: 3}}>Notifications</Typography>
            {notificaciones.some(n => !n.leida) && (
                <Button variant="contained" onClick={handleMarcarTodasLeidas}>Mark all read</Button>
            )}
            <List>{notificaciones.map(
                notificacion => <ListItem 
                key={notificacion.id} 
                button onClick={() => handleClick(notificacion)}
                sx={{ backgroundColor: notificacion.leida ? '#FAE8CA' : '#B8946E'}}>
                <ListItemText primary={notificacion.mensaje} secondary={new Date(notificacion.fecha_creacion).toLocaleString('es-ES')}></ListItemText>
                </ListItem>
            )}</List>
            </Box>
            </PageLayout>
        )
}