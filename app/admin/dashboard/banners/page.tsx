"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MegaCover } from "@/components/home/mega-cover";
import { Save, Loader2, Image as ImageIcon, Link2, Type, Layout, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface BannerConfig {
  key: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  showContent?: boolean;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  align: "left" | "center" | "right";
}

const DEFAULT_CONFIGS: BannerConfig[] = [
  {
    key: "hero-banner-1",
    mediaType: "IMAGE",
    mediaUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920",
    showContent: true,
    badge: "ZEEDIOR EXCLUSIVE 2026",
    title: "LUXURY & CUSTOM CRAFTSMANSHIP",
    subtitle: "Discover personalized rings, engraved wallets, custom printed cups, and unique accessories crafted to perfection.",
    buttonText: "EXPLORE COLLECTION",
    buttonUrl: "/shop",
    align: "center",
  },
  {
    key: "mid-banner-2",
    mediaType: "IMAGE",
    mediaUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920",
    showContent: true,
    badge: "SEASONAL SPOTLIGHT",
    title: "PERSONALIZED GIFTS & UNIQUE GADGETS",
    subtitle: "Unmatched quality personalized products designed to leave a lasting impression for your loved ones.",
    buttonText: "SHOP FEATURED",
    buttonUrl: "/shop",
    align: "left",
  },
];

export default function AdminBannersPage() {
  const { data: session, status } = useSession();
  const [banners, setBanners] = useState<BannerConfig[]>(DEFAULT_CONFIGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
        setBanners(data.banners);
      }
    } catch (e) {
      console.error("Failed to load banners:", e);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="py-20 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const user = session?.user as any;
  if (!session || !user?.isAdmin) {
    redirect("/auth/login?callbackUrl=/admin/dashboard/banners");
  }

  const updateBanner = (index: number, field: keyof BannerConfig, value: any) => {
    setBanners((prevBanners) => {
      const updated = [...prevBanners];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFileUpload = async (index: number, file: File) => {
    const banner = banners[index];
    setUploadingKey(banner.key);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setBanners((prevBanners) => {
          const updated = [...prevBanners];
          updated[index] = { ...updated[index], mediaUrl: data.url, mediaType: "IMAGE" };
          return updated;
        });
      } else {
        alert("File upload failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error uploading image file");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage("Banners updated successfully!");
        setTimeout(() => setToastMessage(""), 4000);
      } else {
        alert(data.error || "Failed to save banners");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving banners");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            Banner Manager
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
            Customize 16:9 banner images, text overlays, titles, and button URLs for your storefront.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Banners
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-zinc-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
          Loading banner settings...
        </div>
      ) : (
        <div className="space-y-12">
          {banners.map((banner, idx) => (
            <div key={banner.key} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-700 dark:text-zinc-300">
                  {banner.key === "hero-banner-1" ? "Banner 1 (Main Hero 16:9)" : "Banner 2 (Featured Spotlight 16:9)"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  16:9 Aspect Ratio
                </span>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form Controls */}
                <div className="space-y-5">
                  {/* Banner Image URL & Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                      <ImageIcon className="h-3.5 w-3.5" /> Banner Image (16:9 Ratio)
                    </label>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={banner.mediaUrl}
                        onChange={(e) => updateBanner(idx, "mediaUrl", e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
                      />
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline">
                          {uploadingKey === banner.key ? "Uploading..." : "Upload New Image"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(idx, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Show/Hide Text & Button Overlay Switch */}
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                        {banner.showContent !== false ? <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <EyeOff className="h-4 w-4 text-zinc-400" />}
                        Text &amp; Button Overlay
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {banner.showContent !== false ? "Text and button are visible over banner" : "Pure image mode (Text & buttons hidden)"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateBanner(idx, "showContent", banner.showContent === false ? true : false)}
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                        banner.showContent !== false
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      {banner.showContent !== false ? "SHOW" : "HIDE"}
                    </button>
                  </div>

                  {/* Text Overlay Controls (Active when showContent is enabled) */}
                  {banner.showContent !== false && (
                    <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      {/* Badge */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-2">
                          <Type className="h-3.5 w-3.5" /> Badge / Tagline (Optional)
                        </label>
                        <input
                          type="text"
                          value={banner.badge}
                          onChange={(e) => updateBanner(idx, "badge", e.target.value)}
                          placeholder="e.g. ZEEDIOR EXCLUSIVE 2026"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-2">
                          <Type className="h-3.5 w-3.5" /> Main Heading Title
                        </label>
                        <input
                          type="text"
                          value={banner.title}
                          onChange={(e) => updateBanner(idx, "title", e.target.value)}
                          placeholder="e.g. LUXURY & CUSTOM CRAFTSMANSHIP"
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold uppercase text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-2">
                          <Type className="h-3.5 w-3.5" /> Subtitle Description
                        </label>
                        <textarea
                          rows={2}
                          value={banner.subtitle}
                          onChange={(e) => updateBanner(idx, "subtitle", e.target.value)}
                          placeholder="e.g. Discover personalized rings, engraved wallets..."
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Button Controls */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-2">
                            <Link2 className="h-3.5 w-3.5" /> Button Text
                          </label>
                          <input
                            type="text"
                            value={banner.buttonText}
                            onChange={(e) => updateBanner(idx, "buttonText", e.target.value)}
                            placeholder="e.g. EXPLORE COLLECTION"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold uppercase text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-2">
                            <Link2 className="h-3.5 w-3.5" /> Button Link URL
                          </label>
                          <input
                            type="text"
                            value={banner.buttonUrl}
                            onChange={(e) => updateBanner(idx, "buttonUrl", e.target.value)}
                            placeholder="e.g. /shop"
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Alignment */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-2">
                          <Layout className="h-3.5 w-3.5" /> Text Alignment
                        </label>
                        <select
                          value={banner.align}
                          onChange={(e) => updateBanner(idx, "align", e.target.value as any)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
                        >
                          <option value="left">Left Aligned</option>
                          <option value="center">Center Aligned</option>
                          <option value="right">Right Aligned</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Live Interactive Preview */}
                <div className="flex flex-col">
                  <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Live Preview (16:9 Frame)
                  </span>
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black flex-1 min-h-[250px]">
                    <MegaCover
                      badge={banner.badge}
                      title={banner.title || "BANNER TITLE"}
                      subtitle={banner.subtitle}
                      primaryCtaText={banner.buttonText}
                      primaryCtaLink={banner.buttonUrl}
                      mediaUrl={banner.mediaUrl}
                      align={banner.align}
                      aspectRatio="aspect-[16/9]"
                      showContent={banner.showContent !== false}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
