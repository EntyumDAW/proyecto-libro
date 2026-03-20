// /frontend/src/components/PageLayout.jsx
import { Box } from '@mui/material';

export const PageLayout = ({ children }) => {
    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                width: '100%',
                backgroundImage: 'url(/fondo.jpg)',
                backgroundSize: '102% 110%',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(0px)',
                }
            }}
        >
            <Box 
                sx={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    py: 4,
                    px: {xs: 3, sm: 4, md: 8, lg: 10, xl: 12},
                    minHeight: '100vh',
                    maxWidth: '1600px',
                    mx: 'auto'
                }}
            >
                {children}
            </Box>
        </Box>
    );
};