import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { InsightsPage } from '../pages/insights/InsightsPage';
import { CreateBriefPage } from '../pages/briefs/CreateBriefPage';
import { AppSidebar } from '../components/layout/AppSidebar/AppSidebar';
import { AiDrawer } from '../features/ai-assistant/components/AiDrawer';
import { ROUTES } from './routePaths';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <AppSidebar />
            <div className={`flex-1 flex ${location.pathname === ROUTES.CREATE_BRIEF ? 'flex-row' : 'flex-col'} relative overflow-hidden`}>
                {children}
                <AiDrawer embedded={location.pathname === ROUTES.CREATE_BRIEF} />
            </div>
        </div>
    );
};

export const AppRouter: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path={ROUTES.LOGIN} element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />
                
                <Route path={ROUTES.SIGNUP} element={
                    <PublicRoute>
                        <SignUpPage />
                    </PublicRoute>
                } />
                
                <Route path={ROUTES.HOME} element={
                    <ProtectedRoute>
                        <MainLayout>
                            <DashboardPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                <Route path={ROUTES.INSIGHTS} element={
                    <ProtectedRoute>
                        <MainLayout>
                            <InsightsPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />
                
                <Route path={ROUTES.CREATE_BRIEF} element={
                    <ProtectedRoute>
                        <MainLayout>
                            <CreateBriefPage />
                        </MainLayout>
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
        </Router>
    );
};
