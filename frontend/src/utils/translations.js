const TRADUCCIONES = {
    // Estado ejemplares
    'disponible': 'Available',
    'reservado': 'Reserved',
    'vendido': 'Sold',
    'intercambiado': 'Exchanged',
    // Condición
    'nuevo': 'New',
    'como_nuevo': 'Like new',
    'buen_estado': 'Good condition',
    'regular': 'Fair',
    // Tipo anuncio / transacción
    'venta': 'Sale',
    'intercambio': 'Exchange',
    // Estado anuncio
    'activo': 'Active',
    'completado': 'Completed',
    'cancelado': 'Cancelled',
    // Estado transacción
    'pendiente': 'Pending',
    'aceptada': 'Accepted',
    'rechazada': 'Rejected',
    'completada': 'Completed',
    'cancelada': 'Cancelled',
};

export const traducir = (valor) => TRADUCCIONES[valor] ?? valor;
