import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Folder, FileText, Lightbulb, Users, BarChart2, Settings, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { firebaseAuthService } from '../../../features/auth/services/firebaseAuth.service';
import { ROUTES } from '../../../routes/routePaths';

export const AppSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { icon: Home, label: 'Home', path: ROUTES.HOME },
        { icon: Folder, label: 'My Briefs', path: ROUTES.BRIEFS },
        { icon: FileText, label: 'Create Brief', path: ROUTES.CREATE_BRIEF },
        { icon: Lightbulb, label: 'Research & Insights', path: ROUTES.RESEARCH },
        { icon: Users, label: 'Audiences', path: ROUTES.AUDIENCES },
        { icon: BarChart2, label: 'Campaign Analysis', path: ROUTES.ANALYSIS },
    ];

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsSettingsOpen(false);
        await firebaseAuthService.logout();
    };

    return (
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 h-screen sticky top-0 z-10">
            <div className="w-10 h-10 bg-mcd-red rounded-md flex items-center justify-center mb-12 cursor-pointer" onClick={() => navigate(ROUTES.HOME)}>
                <span className="text-mcd-yellow font-bold text-xl">M</span>
            </div>

            <nav className="flex-1 flex flex-col gap-4 w-full items-center">
                {navItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(item.path)}
                        className={`p-3 w-full flex justify-center relative transition-colors group ${
                            isActive(item.path) 
                                ? 'text-mcd-black' 
                                : 'text-gray-400 hover:text-mcd-black hover:bg-gray-50'
                        }`}
                        title={item.label}
                    >
                        {isActive(item.path) && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-mcd-yellow rounded-r-md" />
                        )}
                        <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                        <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            <div className="flex flex-col gap-4 w-full items-center mt-auto relative" ref={settingsRef}>
                <button
                    className="p-3 w-full flex justify-center relative text-gray-400 hover:bg-gray-50 hover:text-mcd-black transition-colors group"
                    title="Notifications"
                >
                    <Bell size={24} strokeWidth={2} />
                    <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                        Notifications
                    </span>
                </button>

                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`p-3 w-full flex justify-center relative transition-colors group ${
                        isSettingsOpen ? 'text-mcd-black bg-gray-50' : 'text-gray-400 hover:bg-gray-50 hover:text-mcd-black'
                    }`}
                    title="Settings"
                >
                    <Settings size={24} strokeWidth={2} />
                    {!isSettingsOpen && (
                        <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                            Settings
                        </span>
                    )}
                </button>

                {isSettingsOpen && (
                    <div className="absolute left-full ml-4 bottom-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.displayName || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 text-sm text-mcd-red hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                        >
                            <LogOut size={16} />
                            Log out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
