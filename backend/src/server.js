import express from 'express';
import {errorHandler} from './middlewares/errorHandler.js';
import BookRoutes from './routes/bookRoutes.js';
import CategoriaRoutes from './routes/categoriaRoutes.js';
import AuthRoute from './routes/authRoutes.js';
import EjemplarRoutes from './routes/ejemplarRoutes.js';
import AnuncioRoutes from './routes/anuncioRoutes.js';
import TransaccionRoutes from './routes/transaccionRoutes.js';
import NotificacionesRoutes from './routes/notificacionRoutes.js';
import UsuarioRoutes from './routes/usuarioRoutes.js';
import FavoritoRoutes from './routes/favoritoRoutes.js';
import MensajeRoutes from './routes/mensajeRoutes.js';
import cors from 'cors';
import prisma from "./config/db.js";

// Iniciamos express
const app = express();

// Iniciamos cors y las opciones disponibles
const allowedOrigins = [
    'https://proyecto-libro-frontend.onrender.com',
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) == -1){
            const mensaje = 'CORS ERROR NO ACCESS';
            return callback(new Error(mensaje), false);
        }
        return callback(null, true);
    }
}));

// Usamos el json de express para poder recibir json en los req.body
app.use(express.json({ limit: '10kb' }));

// Usamos el authRoutes
app.use('/api/auth', AuthRoute);

// Usamos bookroutes
app.use('/api/libros', BookRoutes);

// Usamos categorias
app.use('/api/categorias', CategoriaRoutes);

// Ejemplares
app.use('/api/ejemplares', EjemplarRoutes);

// Anuncios
app.use('/api/anuncios', AnuncioRoutes);

// Transacciones
app.use('/api/transacciones', TransaccionRoutes);

// Notificaciones
app.use('/api/notificaciones', NotificacionesRoutes);

// Perfil Usuarios
app.use('/api/perfil', UsuarioRoutes);

// Favoritos
app.use('/api/favoritos', FavoritoRoutes);

// Mensajería
app.use('/api/mensajes', MensajeRoutes);

// Health check (toca BD para mantener viva Supabase)
app.get('/health', async (req, res) => {
    try {
        const inicio = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const dbMs = Date.now() - inicio;
        res.status(200).json({ status: 'ok', db: 'ok', dbMs });
    } catch (err) {
        res.status(503).json({ status: 'error', db: 'down' });
    }
});

// errorHandler para 500.
app.use(errorHandler);

export default app;
