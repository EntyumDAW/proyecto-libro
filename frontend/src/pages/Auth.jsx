import { useState, useEffect } from 'react';
import { Box, Container, Paper, Tabs, Tab, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { Login } from './Login';
import { Register } from './Register';
import {PageLayout} from '../components/PageLayout';

export const AuthPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'registro') {
            setTabValue(1);
        }
    }, [searchParams]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setSearchParams(newValue === 0 ? {} : { tab: 'registro' });
    };

    return (
        <PageLayout>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 300px)',
                width: '100%'
            }}>
            <Paper elevation={3} sx={{
                alignContent: 'center', 
                p: 4, borderRadius: 2, 
                backgroundColor: '#fae8caff', 
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh'
                }}>
                <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
                    Welcome!
                </Typography>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    centered
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                    >
                    <Tab label="Loin" />
                    <Tab label="Register" />
                </Tabs>

                <Box sx={{ mt: 3 }}>
                    {tabValue === 0 ? <Login /> : <Register />}
                </Box>
            </Paper>
                        </Box>
                    </PageLayout>
    );
};