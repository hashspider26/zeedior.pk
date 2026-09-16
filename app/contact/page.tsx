"use client";

import { useState } from "react";
import { Phone, MapPin, Clock, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to send message");
            }

            setSubmitting(false);
            setSubmitted(true);

            // Reset form after 3 seconds
            setTimeout(() => {
                setFormData({ name: "", phone: "", subject: "", message: "" });
                setSubmitted(false);
            }, 3000);
        } catch (err) {
            setSubmitting(false);
            setError(err instanceof Error ? err.message : "Failed to send message");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-black border-b border-zinc-800">
                <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            Have questions about our products or services? We're here to help! Reach out to us and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">
                                Contact Information
                            </h2>
                            <p className="text-zinc-400 mb-8">
                                Feel free to reach out through any of these channels. We're always happy to hear from you!
                            </p>
                        </div>

                        <div className="space-y-4">
                            {/* Phone */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Phone / WhatsApp</h3>
                                    <a href="tel:+923261347455" className="block text-sm text-zinc-400 hover:text-white transition-colors">0326-1347455</a>
                                    <a href="tel:+923411255047" className="block text-sm text-zinc-400 hover:text-white transition-colors">0341-4255047</a>
                                    <a href="tel:+923197214187" className="block text-sm text-zinc-400 hover:text-white transition-colors">0319-7214187</a>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Address</h3>
                                    <p className="text-sm text-zinc-400">
                                        Zeedior.pk<br />
                                        Mianwali, Punjab<br />
                                        Pakistan
                                    </p>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Business Hours</h3>
                                    <p className="text-sm text-zinc-400">
                                        Monday - Saturday<br />
                                        9:00 AM - 6:00 PM PKT
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                Send us a Message
                            </h2>

                            {submitted ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Message Sent!</h3>
                                    <p className="text-zinc-400 text-center max-w-md">
                                        Thank you for contacting us. We'll get back to you as soon as possible.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {error && (
                                        <div className="mb-4 p-4 rounded-lg bg-red-900/20 border border-red-800">
                                            <p className="text-sm text-red-400">{error}</p>
                                        </div>
                                    )}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium text-zinc-300">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-white px-4 py-3 text-sm placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-4 focus:ring-white/5 focus:outline-none transition-all"
                                                placeholder="Enter your name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-sm font-medium text-zinc-300">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-white px-4 py-3 text-sm placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-4 focus:ring-white/5 focus:outline-none transition-all"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="subject" className="text-sm font-medium text-zinc-300">
                                                Subject *
                                            </label>
                                            <select
                                                id="subject"
                                                name="subject"
                                                required
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-white px-4 py-3 text-sm focus:border-zinc-500 focus:ring-4 focus:ring-white/5 focus:outline-none transition-all"
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="product">Product Question</option>
                                                <option value="order">Order Support</option>
                                                <option value="custom">Custom Order</option>
                                                <option value="feedback">Feedback</option>
                                            </select>
                                        </div>
                                    </div>


                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium text-zinc-300">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-white px-4 py-3 text-sm placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-4 focus:ring-white/5 focus:outline-none transition-all resize-none"
                                            placeholder="Enter your message"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-5 w-5" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <section className="bg-black border-t border-zinc-800 py-16 px-4">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "What are your delivery times?",
                                a: "We typically deliver within 3-5 business days across Pakistan via TCS or Leopards Courier."
                            },
                            {
                                q: "Do you offer cash on delivery?",
                                a: "Yes! We offer cash on delivery (COD) for all orders across Pakistan."
                            },
                            {
                                q: "Can I return products?",
                                a: "Yes, we have a return policy for defective or incorrect products. Please contact us within 3 days of receiving your order."
                            },
                            {
                                q: "How can I place a custom order?",
                                a: "Simply WhatsApp us on 0326-1347455 with your design or idea and we'll get back to you with details and pricing!"
                            }
                        ].map((faq, index) => (
                            <details key={index} className="group bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                                <summary className="font-semibold text-white cursor-pointer list-none flex items-center justify-between">
                                    {faq.q}
                                    <span className="ml-4 flex-shrink-0 text-zinc-400">+</span>
                                </summary>
                                <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
