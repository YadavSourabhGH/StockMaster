import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../utils/axiosClient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axiosClient.get('/users/profile');
            setProfile(response.data);
            setFormData(prev => ({ ...prev, name: response.data.name }));
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            return toast.error('New passwords do not match');
        }

        setIsSaving(true);
        try {
            const payload = { name: formData.name };
            if (formData.newPassword) {
                payload.password = formData.password;
                payload.newPassword = formData.newPassword;
            }

            await axiosClient.put('/users/profile', payload);
            toast.success('Profile updated successfully');
            setFormData(prev => ({ ...prev, password: '', newPassword: '', confirmNewPassword: '' }));
            fetchProfile();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex h-full items-center justify-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100 text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <User className="h-12 w-12" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{profile?.name}</h2>
                        <p className="text-sm text-slate-500">{profile?.role}</p>

                        <div className="mt-6 space-y-3 text-left">
                            <div className="flex items-center text-sm text-slate-600">
                                <Mail className="mr-2 h-4 w-4" />
                                {profile?.email}
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <Shield className="mr-2 h-4 w-4" />
                                {profile?.role?.toUpperCase()} Access
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2">
                    <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-100">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit Profile</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="mb-4 text-sm font-medium text-slate-900">Change Password (Optional)</h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Current Password</label>
                                        <Input
                                            name="password"
                                            type="password"
                                            placeholder="Required to set new password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">New Password</label>
                                            <Input
                                                name="newPassword"
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                                            <Input
                                                name="confirmNewPassword"
                                                type="password"
                                                value={formData.confirmNewPassword}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
