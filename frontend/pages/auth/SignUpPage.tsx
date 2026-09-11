import React from 'react';
import { SignUpForm } from '../../features/auth/components/SignUpForm';

export const SignUpPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <SignUpForm />
        </div>
    );
};
