import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import axiosClient from '../../utils/axiosClient';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let interval;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axiosClient.post('/auth/request-otp', { email });
            toast.success('OTP sent to your email!');
            // Navigate to reset password page with email state
            navigate('/reset-password', { state: { email } });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
                    <p className="text-slate-600">Enter your email to receive an OTP</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || cooldown > 0}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send OTP'}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <Link to="/login" className="flex items-center justify-center text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
                <div className="mt-2 text-center text-sm">
                    <Link to="/reset-password" class="text-primary hover:underline">
                        Have an OTP? Reset Password
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
