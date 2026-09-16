import { Sparkles, Target, Award, Users, Zap, Heart, TrendingUp, Shield } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-black border-b border-zinc-800">
                <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                                <Sparkles className="h-4 w-4 text-white" />
                                <span className="text-sm font-semibold text-white/80">Est. 2024</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                                Crafted with Passion,<br />
                                <span className="text-zinc-400">
                                    Built for You
                                </span>
                            </h1>
                            <p className="text-lg text-zinc-400 leading-relaxed">
                                At Zeedior.pk, we're passionate about bringing unique, custom-made products to your doorstep — from personalized rings and wallets to premium gadgets and printed cups.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-700 shadow-lg bg-zinc-900 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/aboutimg.jfif"
                                    alt="Zeedior.pk - Custom Products"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                <Target className="h-7 w-7 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Our Mission</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                To make personalized, high-quality custom products accessible to everyone in Pakistan — letting you express your unique style through engraved rings, custom wallets, printed cups, and the latest gadgets.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                <Award className="h-7 w-7 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Our Vision</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                To become Pakistan's most trusted destination for custom-made and unique products — a place where every customer finds something truly one-of-a-kind that reflects their personality.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="bg-black border-y border-zinc-800 py-20 px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Our Story
                        </h2>
                        <p className="text-lg text-zinc-400">
                            From a passion for unique products to Pakistan's custom store
                        </p>
                    </div>

                    <div className="max-w-none">
                        <p className="text-zinc-400 leading-relaxed mb-6">
                            Zeedior.pk was born from a simple idea: everyone deserves products that feel personal. We saw a gap in the market — people wanted unique, customized items they could call truly their own, but quality options were hard to find in Pakistan.
                        </p>
                        <p className="text-zinc-400 leading-relaxed mb-6">
                            We started with custom rings and engraved wallets, then expanded to printed cups, phone accessories, and gadgets. Every product we add to our catalog goes through careful quality checks so we only deliver the best.
                        </p>
                        <p className="text-zinc-400 leading-relaxed">
                            Today, Zeedior.pk serves customers across Pakistan, delivering smiles along with every package. Whether it's a gift or something for yourself — we make it special.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Quality First",
                                description: "Every product is crafted with premium materials and inspected before shipping."
                            },
                            {
                                icon: Heart,
                                title: "Customer Care",
                                description: "Your satisfaction is everything. We go above and beyond to make you happy."
                            },
                            {
                                icon: Sparkles,
                                title: "Personalization",
                                description: "We believe in making products that are truly unique — just like you."
                            },
                            {
                                icon: Users,
                                title: "Community",
                                description: "Building a community of customers who love unique, creative, custom products."
                            }
                        ].map((value, index) => (
                            <div key={index} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-primary/50 transition-all group">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <value.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-black border-y border-zinc-800 py-16 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: "1000+", label: "Happy Customers" },
                            { number: "100+", label: "Custom Products" },
                            { number: "50+", label: "Cities Served" },
                            { number: "98%", label: "Satisfaction Rate" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            Why Choose Zeedior.pk?
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            What sets us apart from the rest
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: TrendingUp,
                                title: "Premium Craftsmanship",
                                description: "Every custom order is made with precision and care by skilled craftsmen."
                            },
                            {
                                icon: Shield,
                                title: "Quality Guarantee",
                                description: "100% satisfaction guaranteed. Not happy? We'll make it right, no questions asked."
                            },
                            {
                                icon: Users,
                                title: "Dedicated Support",
                                description: "Our team is always ready to help you customize your perfect product."
                            },
                            {
                                icon: Sparkles,
                                title: "Unique Designs",
                                description: "Wide selection of styles, materials, and customization options to match your vision."
                            },
                            {
                                icon: Award,
                                title: "Trusted Brand",
                                description: "Thousands of satisfied customers across Pakistan trust Zeedior for their orders."
                            },
                            {
                                icon: Heart,
                                title: "Made with Love",
                                description: "We pour heart into every product. We only sell what we'd proudly give as a gift."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow">
                                <feature.icon className="h-8 w-8 text-primary mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-black py-20 px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to Order Something Unique?
                    </h2>
                    <p className="text-lg text-zinc-400 mb-8">
                        Join hundreds of happy customers across Pakistan. Browse our collection and get your custom product today!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/shop"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-zinc-950 font-semibold hover:bg-zinc-100 transition-all shadow-lg hover:scale-105"
                        >
                            Browse Products
                        </a>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-transparent border-2 border-white/30 text-white font-semibold hover:bg-white/10 hover:border-white/60 transition-all"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
