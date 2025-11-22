import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layers, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [step, setStep] = useState(1); // 1: Email/Password, 2: OTP (only for otp method)
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithOtp, verifyLoginOtp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (loginMethod === 'password') {
                await login(email, password);
                toast.success('Welcome back!');
                navigate('/dashboard');
            } else {
                // OTP Method
                if (step === 1) {
                    await loginWithOtp(email);
                    toast.success('OTP sent to your email!');
                    setStep(2);
                } else {
                    await verifyLoginOtp(email, otp);
                    toast.success('Welcome back!');
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMethod = () => {
        setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
        setStep(1);
        setOtp('');
        setPassword('');
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center px-8 sm:px-12 lg:w-1/2 xl:px-24 bg-white overflow-y-auto">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-8 flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-600 p-1.5">
                            <Layers className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">StockMaster AI</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {step === 2 ? 'Enter OTP' : 'Welcome back'}
                        </h1>
                        <p className="mt-2 text-slate-600">
                            {step === 2
                                ? `We've sent a login code to ${email}`
                                : 'Enter your credentials to sign in'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {loginMethod === 'password' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700">Password</label>
                                    <Link to="/forgot-password" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {loginMethod === 'otp' && step === 2 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Enter OTP</label>
                                <Input
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest"
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {loginMethod === 'password'
                                ? 'Sign In'
                                : (step === 1 ? 'Send Login Link' : 'Verify & Login')}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={toggleMethod}
                            disabled={isLoading}
                        >
                            {loginMethod === 'password' ? (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Login with OTP
                                </>
                            ) : (
                                'Login with Password'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden w-1/2 bg-slate-50 lg:block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90 mix-blend-multiply" />
                <img
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Warehouse"
                    className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium">
                            "StockMaster AI has completely transformed how we manage our inventory. The real-time tracking is a game changer."
                        </p>
                        <footer className="text-sm text-indigo-100">
                            Sofia Davis, Logistics Manager
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
};

export default Login;
