import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Zap, Layers } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import dashboardImg from '../../assets/dashboard.png';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-2">
                        <div className="rounded-lg bg-indigo-600 p-1.5">
                            <Layers className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">StockMaster AI</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/login">
                            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                            Inventory management <br className="hidden sm:block" />
                            <span className="text-indigo-600">reimagined for growth.</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
                            Stop wrestling with spreadsheets. StockMaster AI gives you real-time tracking, smart insights, and seamless control over your entire supply chain.
                        </p>
                        <div className="mt-10 flex justify-center gap-4">
                            <Link to="/signup">
                                <Button size="lg" className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 transition-transform hover:-translate-y-0.5">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/demo">
                                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                    Watch Demo
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image / Dashboard Preview */}
                    <div className="relative mt-20">
                        <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-2xl"></div>
                        <div className="relative rounded-xl border border-slate-200 bg-white/50 p-2 shadow-2xl backdrop-blur-sm lg:rounded-2xl lg:p-4">
                            <div className="aspect-[16/9] overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                                <img
                                    src={dashboardImg}
                                    alt="StockMaster Dashboard"
                                    className="h-full w-full object-cover object-top"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-slate-50 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">Features</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Everything you need to scale.
                        </p>
                    </div>

                    <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: Zap,
                                title: 'Real-time Tracking',
                                desc: 'Monitor stock levels across multiple warehouses instantly. Never run out of stock again.'
                            },
                            {
                                icon: BarChart3,
                                title: 'Smart Analytics',
                                desc: 'Get AI-powered insights into sales trends, reorder points, and inventory turnover.'
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Secure & Reliable',
                                desc: 'Enterprise-grade security with role-based access control and complete audit logs.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group relative rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md border border-slate-100">
                                <div className="mb-6 inline-flex rounded-lg bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                                <p className="mt-4 text-slate-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-100 bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 text-center text-slate-500 sm:px-6 lg:px-8">
                    <p>&copy; 2024 StockMaster AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
