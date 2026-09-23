"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon, Upload, Edit, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

interface SubCategory {
    id: string;
    name: string;
    categoryId: string;
}

interface Category {
    id: string;
    name: string;
    image?: string | null;
    subcategories?: SubCategory[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryImage, setNewCategoryImage] = useState("");
    const [selectedCatId, setSelectedCatId] = useState<string>("");
    const [newSubCategory, setNewSubCategory] = useState("");
    
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingImageId, setEditingImageId] = useState<string | null>(null);
    const [editImageUrl, setEditImageUrl] = useState("");
    const [updatingCatId, setUpdatingCatId] = useState<string | null>(null);

    const [addingSub, setAddingSub] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [subError, setSubError] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
                if (data.length > 0 && !selectedCatId) {
                    setSelectedCatId(data[0].id);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, callback: (url: string) => void) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.url) {
                callback(data.url);
            } else {
                alert("File upload failed");
            }
        } catch (e) {
            console.error(e);
            alert("Error uploading image file");
        } finally {
            setUploading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setAdding(true);
        setError("");

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategory, image: newCategoryImage || null }),
            });

            if (res.ok) {
                setNewCategory("");
                setNewCategoryImage("");
                fetchCategories();
            } else {
                setError("Failed to add category. Name might be duplicate.");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setAdding(false);
        }
    };

    const handleUpdateCategory = async (id: string, updatedImage: string) => {
        setUpdatingCatId(id);
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: updatedImage || null }),
            });

            if (res.ok) {
                setEditingImageId(null);
                fetchCategories();
            } else {
                alert("Failed to update category image");
            }
        } catch (err) {
            alert("Error updating category image");
        } finally {
            setUpdatingCatId(null);
        }
    };

    const handleAddSubCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubCategory.trim() || !selectedCatId) return;

        setAddingSub(true);
        setSubError("");

        try {
            const res = await fetch("/api/subcategories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSubCategory, categoryId: selectedCatId }),
            });

            if (res.ok) {
                setNewSubCategory("");
                fetchCategories();
            } else {
                setSubError("Failed to add subcategory. Might be duplicate for this category.");
            }
        } catch (err) {
            setSubError("Something went wrong");
        } finally {
            setAddingSub(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category and all its subcategories?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id));
            } else {
                alert("Failed to delete category");
            }
        } catch (err) {
            alert("Error deleting category");
        } finally {
            setDeleting(null);
        }
    };

    const handleDeleteSub = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subcategory?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchCategories();
            } else {
                alert("Failed to delete subcategory");
            }
        } catch (err) {
            alert("Error deleting subcategory");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Categories &amp; Subcategories</h1>
                <p className="text-zinc-500">Manage main categories, thumbnails, and nested subcategories for your store</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Forms Section */}
                <div className="space-y-6">
                    {/* Add Main Category Form */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-base font-bold mb-3 text-zinc-900 dark:text-white">Add Main Category</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-zinc-800 dark:bg-black dark:text-white"
                                    placeholder="e.g. Customized Gifts"
                                />
                            </div>

                            {/* Category Thumbnail Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                    Category Thumbnail Image (Optional)
                                </label>
                                <div className="space-y-2">
                                    {newCategoryImage ? (
                                        <div className="relative h-28 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-950 group">
                                            <img src={newCategoryImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setNewCategoryImage("")}
                                                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                                                title="Remove image"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newCategoryImage}
                                                onChange={(e) => setNewCategoryImage(e.target.value)}
                                                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary dark:border-zinc-800 dark:bg-black dark:text-white"
                                                placeholder="Image URL or upload file →"
                                            />
                                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors">
                                                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                                <span>Upload</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(file, (url) => setNewCategoryImage(url));
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && <p className="text-xs text-red-500">{error}</p>}
                            <button
                                type="submit"
                                disabled={adding || uploading || !newCategory.trim()}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                            >
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Add Category
                            </button>
                        </form>
                    </div>

                    {/* Add Subcategory Form */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h2 className="text-base font-bold mb-3 text-zinc-900 dark:text-white">Add Subcategory</h2>
                        <form onSubmit={handleAddSubCategory} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Parent Category</label>
                                <select
                                    value={selectedCatId}
                                    onChange={(e) => setSelectedCatId(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-zinc-800 dark:bg-black dark:text-white font-medium"
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Subcategory Name</label>
                                <input
                                    type="text"
                                    value={newSubCategory}
                                    onChange={(e) => setNewSubCategory(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary dark:border-zinc-800 dark:bg-black dark:text-white"
                                    placeholder="e.g. Engraved Rings, Custom Wallets"
                                />
                            </div>
                            {subError && <p className="text-xs text-red-500">{subError}</p>}
                            <button
                                type="submit"
                                disabled={addingSub || !newSubCategory.trim() || !selectedCatId}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-4 py-2.5 text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all shadow-sm"
                            >
                                {addingSub ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Add Subcategory
                            </button>
                        </form>
                    </div>
                </div>

                {/* Categories & Subcategories List */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : categories.length === 0 ? (
                        <div className="text-center p-8 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            No categories found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {categories.map((cat) => (
                                <div key={cat.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
                                    <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                        <div className="flex items-center gap-4">
                                            {/* Thumbnail Image */}
                                            <div className="relative h-14 w-14 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-950 flex-shrink-0 flex items-center justify-center">
                                                {cat.image ? (
                                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="h-6 w-6 text-zinc-400" />
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                                                    {cat.name}
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                        {cat.subcategories?.length || 0} Subcategories
                                                    </span>
                                                </h3>
                                                <button
                                                    onClick={() => {
                                                        if (editingImageId === cat.id) {
                                                            setEditingImageId(null);
                                                        } else {
                                                            setEditingImageId(cat.id);
                                                            setEditImageUrl(cat.image || "");
                                                        }
                                                    }}
                                                    className="text-xs font-semibold text-primary hover:underline mt-1 inline-flex items-center gap-1"
                                                >
                                                    <Edit className="h-3 w-3" /> {cat.image ? "Change Thumbnail" : "Add Thumbnail"}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            disabled={deleting === cat.id}
                                            className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                                            title="Delete main category"
                                        >
                                            {deleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {/* Inline Edit Image Box */}
                                    {editingImageId === cat.id && (
                                        <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2 animate-in fade-in">
                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                                                Update Category Thumbnail
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editImageUrl}
                                                    onChange={(e) => setEditImageUrl(e.target.value)}
                                                    placeholder="Image URL or Upload →"
                                                    className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                                                />
                                                <label className="cursor-pointer px-2.5 py-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                                                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Upload"}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleFileUpload(file, (url) => setEditImageUrl(url));
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    onClick={() => handleUpdateCategory(cat.id, editImageUrl)}
                                                    disabled={updatingCatId === cat.id}
                                                    className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary/90 transition-all flex items-center gap-1"
                                                >
                                                    {updatingCatId === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingImageId(null)}
                                                    className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Subcategories list */}
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Subcategories</h4>
                                        {cat.subcategories && cat.subcategories.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {cat.subcategories.map((sub) => (
                                                    <div
                                                        key={sub.id}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                                                    >
                                                        <span>{sub.name}</span>
                                                        <button
                                                            onClick={() => handleDeleteSub(sub.id)}
                                                            className="text-zinc-400 hover:text-red-500 transition-colors ml-1"
                                                            title="Delete subcategory"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-zinc-400 italic">No subcategories added yet.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
