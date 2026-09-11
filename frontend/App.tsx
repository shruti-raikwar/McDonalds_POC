import React from 'react';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import { AppProvider } from './context/AppContext';
import { AppRouter } from './routes/AppRouter';

const App: React.FC = () => {
    return (
        <QueryProvider>
            <AuthProvider>
                <AppProvider>
                    <AppRouter />
                </AppProvider>
            </AuthProvider>
        </QueryProvider>
    );
};

export default App;
