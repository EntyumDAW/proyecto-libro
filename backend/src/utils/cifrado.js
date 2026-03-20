import crypto from 'crypto';

// Algoritmo de cifrado simétrico AES-256-CBC
const ALGORITMO = 'aes-256-cbc';

// Derivamos una clave de 32 bytes a partir del secreto de cifrado usando scrypt
if (!process.env.ENCRYPTION_KEY) throw new Error('Missing required environment variable: ENCRYPTION_KEY');
const CLAVE = crypto.scryptSync(
    process.env.ENCRYPTION_KEY,
    process.env.ENCRYPTION_SALT || 'sal_proyectolibro_v1',
    32
);

// Cifra un texto plano usando AES-256-CBC con IV aleatorio
export const cifrar = (texto) => {
    // Generamos un IV (vector de inicialización) aleatorio de 16 bytes para cada mensaje
    const iv = crypto.randomBytes(16);
    const cifrador = crypto.createCipheriv(ALGORITMO, CLAVE, iv);

    let cifrado = cifrador.update(texto, 'utf8', 'hex');
    cifrado += cifrador.final('hex');

    // Devolvemos IV + contenido cifrado separados por ":" para poder descifrar después
    return `${iv.toString('hex')}:${cifrado}`;
};

// Descifra un texto previamente cifrado con cifrar()
export const descifrar = (textoCifrado) => {
    const partes = textoCifrado.split(':');
    if (partes.length !== 2) throw new Error('Formato de mensaje cifrado inválido');

    const [ivHex, cifrado] = partes;
    const iv = Buffer.from(ivHex, 'hex');

    const descifrador = crypto.createDecipheriv(ALGORITMO, CLAVE, iv);
    let descifrado = descifrador.update(cifrado, 'hex', 'utf8');
    descifrado += descifrador.final('utf8');

    return descifrado;
};
