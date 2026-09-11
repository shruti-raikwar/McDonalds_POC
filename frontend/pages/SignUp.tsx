import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';

const SignUp: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const navigate = useNavigate();
    const { signUp } = useAppContext();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const trimmedUsername = username.trim();
        if (trimmedUsername.length < 2) {
            setError('Username must be at least 2 characters long.');
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            setError('Enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setError('Your password does not meet the required security rules (minimum 6 characters).');
            return;
        }

        setIsSubmitting(true);
        try {
            await signUp(normalizedEmail, password, trimmedUsername);
            setSuccess('Account created successfully.');
            navigate('/');
        } catch (err: any) {
            const code = err.code;
            if (code === 'auth/email-already-in-use') {
                setError('An account already exists with this email. Please log in.');
            } else if (code === 'auth/invalid-email') {
                setError('Enter a valid email address.');
            } else if (code === 'auth/weak-password') {
                setError('Your password does not meet the required security rules.');
            } else if (code === 'auth/operation-not-allowed') {
                setError('Email and password registration is currently unavailable.');
            } else if (code === 'auth/network-request-failed') {
                setError('Unable to connect. Check your internet connection and try again.');
            } else if (code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait and try again.');
            } else {
                setError('Unable to create your account. Please try again.');
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign up to begin creating and managing your Feel Briefs.
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-mcd-red p-4 mb-4 rounded-r-md">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}
                
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-r-md">
                        <p className="text-sm text-green-700 font-medium">{success}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-1">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mcd-yellow focus:border-transparent transition-all"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
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
                                    placeholder="Create a password"
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

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-mcd-black bg-mcd-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mcd-yellow transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-mcd-red hover:text-red-700 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
