import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();
    const { signIn } = useAppContext();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        try {
            await signIn(normalizedEmail, password);
            navigate('/');
        } catch (err: any) {
            const code = err.code;
            if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
                setError('Incorrect email or password.');
            } else if (code === 'auth/invalid-email') {
                setError('Enter a valid email address.');
            } else if (code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait and try again.');
            } else if (code === 'auth/network-request-failed') {
                setError('Unable to connect. Check your internet connection and try again.');
            } else {
                setError('Unable to complete your request. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div>
                    <div className="mx-auto w-16 h-16 bg-mcd-red rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-mcd-yellow font-bold text-4xl">M</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to continue to your briefing workspace.
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-mcd-red p-4 mb-4 rounded-r-md">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mcd-yellow focus:border-transparent transition-all"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mcd-yellow focus:border-transparent transition-all pr-12"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-mcd-darkgray hover:text-black transition-colors">
                                Forgot Password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-mcd-black bg-mcd-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mcd-yellow transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-bold text-mcd-red hover:text-red-700 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
