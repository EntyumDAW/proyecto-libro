import server from './server.js';
import { envPort } from './config/env.js';

// E escuchamos en el puerto designado con un mensaje cuando esté listo.
server.listen(envPort, '0.0.0.0', () => {
    console.log("SERVER LISTENING");
})

