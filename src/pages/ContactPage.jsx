import React, { useState } from 'react';
import {
    Mail,
    MapPin,
    PhoneCall,
    Send,
    MessageSquare,
    Clock,
    ArrowRight,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState({
        submitting: false,
        success: false,
        error: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ submitting: true, success: false, error: '' });

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to send message. Please try again later.');
            }

            setStatus({ submitting: false, success: true, error: '' });
            setFormData({ name: '', email: '', subject: '', message: '' });

            setTimeout(() => {
                setStatus(prev => ({ ...prev, success: false }));
            }, 5000);
        } catch (err) {
            setStatus({
                submitting: false,
                success: false,
                error: err.message || 'Failed to send message. Please try again later.'
            });
        }
    };

    return (
        <div className="bg-slate-50 py-10 animate-fade-in">
            {/* HEADER SECTION */}
            <div className="relative isolate px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mx-auto max-w-2xl text-center mb-10">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
                        Get in Touch
                    </h2>
                    <p className="text-base leading-7 text-slate-600 max-w-xl mx-auto">
                        Have questions about our platform, need technical support, or want to report an issue? Our team is here to help you succeed.
                    </p>
                </div>

                <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT: CONTACT INFO */}
                    <div className="relative rounded-2xl bg-indigo-900 p-8 shadow-xl overflow-hidden isolation-auto">
                        {/* Background Pattern */}
                        <div className="absolute inset-x-0 top-0 -z-10 h-full w-full opacity-10"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
                        ></div>
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
                        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Contact Information</h3>
                                <p className="text-indigo-200 text-sm leading-relaxed mb-8">
                                    Fill out the form and our team will get back to you within 24 hours.
                                </p>
                            </div>

                            <div className="space-y-8 flex-1">
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-800/50 ring-1 ring-white/10 backdrop-blur-sm">
                                        <PhoneCall className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white mb-1">Call Us</p>
                                        <a href="tel:+15551234567" className="text-indigo-200 hover:text-white transition-colors text-sm">+1 (555) 123-4567</a>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-800/50 ring-1 ring-white/10 backdrop-blur-sm">
                                        <Mail className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white mb-1">Email Support</p>
                                        <a href="mailto:support@clouvr.com" className="text-indigo-200 hover:text-white transition-colors text-sm">support@clouvr.com</a>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-800/50 ring-1 ring-white/10 backdrop-blur-sm">
                                        <MapPin className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white mb-1">Headquarters</p>
                                        <p className="text-indigo-200 text-sm">123 Tech Boulevard<br />San Francisco, CA 94105</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-800/50 ring-1 ring-white/10 backdrop-blur-sm">
                                        <Clock className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white mb-1">Support Hours</p>
                                        <p className="text-indigo-200 text-sm">Monday - Friday<br />9:00 AM - 6:00 PM EST</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: CONTACT FORM */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-900/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Send us a message</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                                        Full Name
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-slate-50 hover:bg-white"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                                        Email address
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-slate-50 hover:bg-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium leading-6 text-slate-900">
                                    Subject
                                </label>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        name="subject"
                                        id="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-slate-50 hover:bg-white"
                                        placeholder="How can we help?"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium leading-6 text-slate-900">
                                    Message
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        name="message"
                                        id="message"
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all bg-slate-50 hover:bg-white resize-none"
                                        placeholder="Provide as much detail as possible..."
                                    />
                                </div>
                            </div>

                            {status.error && (
                                <div className="rounded-xl bg-red-50 p-4 ring-1 ring-inset ring-red-600/20 flex gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-red-800">Message Failed</p>
                                        <p className="text-red-700 mt-1">{status.error}</p>
                                    </div>
                                </div>
                            )}

                            {status.success && (
                                <div className="rounded-xl bg-green-50 p-4 ring-1 ring-inset ring-green-600/20 flex gap-3 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-green-800">Message Sent Successfully</p>
                                        <p className="text-green-700 mt-1">Thank you for reaching out. Our team will contact you shortly.</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={status.submitting}
                                    className="w-full rounded-xl bg-indigo-600 px-8 py-3.5 text-center text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {status.submitting ? 'Sending Message...' : 'Send Message'}
                                    {!status.submitting && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
