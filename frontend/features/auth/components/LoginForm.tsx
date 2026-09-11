import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AUTH_CONTENT } from '../../../content/auth.content';
import { firebaseAuthService } from '../services/firebaseAuth.service';
import { ROUTES } from '../../../routes/routePaths';

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const content = AUTH_CONTENT.login;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail || !password) {
            setError(AUTH_CONTENT.errors.missingFields);
            return;
        }

        setIsSubmitting(true);
        try {
            await firebaseAuthService.signIn({ email: normalizedEmail, password });
        } catch (err: any) {
            const code = err.code;
            if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
                setError(AUTH_CONTENT.errors.invalidCredentials);
            } else if (code === 'auth/invalid-email') {
                setError(AUTH_CONTENT.errors.invalidEmail);
            } else if (code === 'auth/too-many-requests') {
                setError(AUTH_CONTENT.errors.tooManyRequests);
            } else if (code === 'auth/network-request-failed') {
                setError(AUTH_CONTENT.errors.networkError);
            } else {
                setError(AUTH_CONTENT.errors.default);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
            <div>
                <div className="mx-auto w-16 h-16 bg-mcd-red rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-mcd-yellow font-bold text-4xl">M</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {content.title}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {content.subtitle}
                </p>
            </div>
            
            {error && (
                <div className="bg-red-50 border-l-4 border-mcd-red p-4 mb-4 rounded-r-md">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 mb-1">{content.emailLabel}</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mcd-yellow focus:border-transparent transition-all"
                            placeholder={content.emailPlaceholder}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">{content.passwordLabel}</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mcd-yellow focus:border-transparent transition-all pr-12"
                                placeholder={content.passwordPlaceholder}
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
                            {content.forgotPassword}
                        </a>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-mcd-black bg-mcd-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mcd-yellow transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? content.submittingButton : content.submitButton}
                    </button>
                </div>
                
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        {content.noAccountText}{' '}
                        <Link to={ROUTES.SIGNUP} className="font-bold text-mcd-red hover:text-red-700 transition-colors">
                            {content.signUpLink}
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};
