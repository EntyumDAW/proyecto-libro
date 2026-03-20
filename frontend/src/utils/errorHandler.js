const STATUS_MESSAGES = {
    400: 'Invalid request. Please check the data you submitted.',
    401: 'You must be logged in to do this.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists.',
    500: 'Server error. Please try again later.',
    503: 'Service unavailable. Please try again later.',
};

export const getErrorMessage = (err) => {
    if (!err.response) {
        return 'Connection error. Please check your internet connection.';
    }
    // El servidor devuelve su propio mensaje → tiene prioridad
    const serverMsg = err.response?.data?.error;
    if (serverMsg) return serverMsg;

    return STATUS_MESSAGES[err.response.status] ?? `Unexpected error (${err.response.status})`;
};
