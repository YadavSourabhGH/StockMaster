import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Layers, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';


const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [isLoading, setIsLoading] = useState(false);
    const { signup, verifyEmail } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (step === 1) {
                await signup(formData.name, formData.email, formData.password);
                toast.success('OTP sent to your email!');
                setStep(2);
            } else {
                await verifyEmail(formData.email, otp);
                toast.success('Account verified successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Signup failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
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
                            {step === 1 ? 'Create an account' : 'Verify your email'}
                        </h1>
                        <p className="mt-2 text-slate-600">
                            {step === 1
                                ? 'Enter your details to get started with your free trial'
                                : `We've sent a verification code to ${formData.email}`}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <Input
                                        name="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Password</label>
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Enter OTP</label>
                                <Input
                                    name="otp"
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
                            {step === 1 ? 'Create Account' : 'Verify Email'}
                        </Button>

                        {step === 2 && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => setStep(1)}
                                disabled={isLoading}
                            >
                                Back to details
                            </Button>
                        )}
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden w-1/2 bg-slate-50 lg:block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 opacity-90 mix-blend-multiply" />
                <img
                    src="https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Warehouse"
                    className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium">
                            "The AI insights helped us reduce waste by 20% in the first month alone. Highly recommended."
                        </p>
                        <footer className="text-sm text-indigo-100">
                            Marcus Chen, Operations Director
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
};

export default Signup;
