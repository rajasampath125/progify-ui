/**
 * ManageTypesModal.jsx
 * Admin/Recruiter modal to create and delete custom interview types.
 */
import React, { useState, useMemo } from "react";
import { Plus, X, Trash2, Loader2, Palette } from "lucide-react";
import Modal from "../../../components/Modal";
import { TYPE_CONFIG } from "./calendarConfig";

const ManageTypesModal = ({ customTypes, onAdd, onDelete, onClose }) => {
    const [name, setName] = useState("");
    const [color, setColor] = useState("#6366f1");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const handleAdd = async () => {
        if (!name.trim()) return;
        setSaving(true);
        setError("");
        try {
            await onAdd(name, color);
            setName("");
            setColor("#6366f1");
        } catch (err) {
            const msg = err?.response?.data ?? err?.message ?? "";
            setError(typeof msg === "string" && msg ? msg : "A type with that name already exists.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await onDelete(id);
        } catch {
            alert("Failed to delete type.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="p-6 rounded-2xl bg-white">
                {/* Header */}
                <div className="mb-5 border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-indigo-500" />
                        Manage Event Types
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Create custom interview categories with unique colors
                    </p>
                </div>

                {/* Add new type */}
                <div className="mb-5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Add New Type
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            maxLength={80}
                            placeholder="e.g. Behavioral, System Design..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(""); }}
                            onKeyDown={e => e.key === "Enter" && handleAdd()}
                        />
                        <input
                            type="color"
                            title="Pick a color"
                            className="w-10 h-[38px] p-0.5 border-2 border-slate-200 rounded-lg cursor-pointer bg-white"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={saving || !name.trim()}
                            className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add
                        </button>
                    </div>
                    {error && (
                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                            <X className="w-3 h-3" />{error}
                        </p>
                    )}
                </div>

                {/* Built-in types list */}
                <div className="space-y-1.5 mb-3">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Built-in</label>
                    {Object.entries(TYPE_CONFIG).filter(([k]) => k !== "Blocked").map(([typeName, cfg]) => (
                        <div key={typeName} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.dot }} />
                                <span className="text-[13px] font-medium text-slate-700">{typeName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Default</span>
                        </div>
                    ))}
                </div>

                {/* Custom types list */}
                {customTypes.length > 0 ? (
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Custom</label>
                        {customTypes.map(ct => (
                            <div key={ct.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 group">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: ct.color, borderColor: ct.color }} />
                                    <span className="text-[13px] font-medium text-slate-700">{ct.name}</span>
                                </div>
                                <button
                                    disabled={deletingId === ct.id}
                                    onClick={() => handleDelete(ct.id)}
                                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 transition-all font-medium"
                                >
                                    {deletingId === ct.id
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : <Trash2 className="w-3.5 h-3.5" />}
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                        <Palette className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-[12px] text-slate-400">No custom types yet. Add one above!</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ManageTypesModal;
