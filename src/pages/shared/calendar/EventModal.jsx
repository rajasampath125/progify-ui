/**
 * EventModal.jsx
 * Modal form for creating or editing an interview schedule block.
 */
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    X, Trash2, Loader2, CheckCircle2, Users,
    Calendar as CalendarIcon, Clock, ChevronRight
} from "lucide-react";
import Modal from "../../../components/Modal";
import { inputCls } from "./calendarConfig";

const INTERVIEW_TYPES = [
    { value: "Screening", label: "Screening (HR/Phone)" },
    { value: "Technical", label: "Technical / Coding" },
    { value: "Recruiter", label: "Recruiter Sync" },
    { value: "Other", label: "Other" },
];

const DateTimeRow = ({ dateLabel, timeLabel, dateVal, timeVal, onDateChange, onTimeChange }) => (
    <>
        <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{dateLabel}</label>
            <div className="relative">
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="date" className={inputCls} value={dateVal} onChange={onDateChange} />
            </div>
        </div>
        <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{timeLabel}</label>
            <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input type="time" className={inputCls} value={timeVal} onChange={onTimeChange} />
            </div>
        </div>
    </>
);

const EventModal = ({
    selectedEvent,
    formData,
    setFormData,
    onSave,
    onDelete,
    onClose,
    candidates,
    customTypes,
    isPrivileged,
}) => {
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [candSearch, setCandSearch] = useState("");
    const [candDropOpen, setCandDropOpen] = useState(false);
    const candRef = useRef(null);

    // Close candidat dropdown on outside click
    useEffect(() => {
        const h = (e) => {
            if (candRef.current && !candRef.current.contains(e.target)) setCandDropOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const filteredCands = useMemo(
        () => candidates.filter(c =>
            c.name.toLowerCase().includes(candSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(candSearch.toLowerCase())
        ),
        [candidates, candSearch]
    );

    const selectedCandName = formData.candidateId
        ? candidates.find(c => c.id === formData.candidateId)?.name
        : null;

    const set = (patch) => setFormData(p => ({ ...p, ...patch }));

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            await onSave(formData);
        } catch (err) {
            setError(err.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="p-6 rounded-2xl bg-white">
                {/* Header */}
                <div className="mb-5 border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900">
                        {selectedEvent ? "Edit Interview Block" : "Schedule Interview"}
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        {selectedEvent ? "Update the details below" : "Fill in the details to create a new block"}
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Error banner */}
                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 text-red-700 px-3 py-2.5 rounded-lg text-[13px] border border-red-100">
                            <X className="w-4 h-4 shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* Editing: show candidate info */}
                    {isPrivileged && selectedEvent && (
                        <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-lg text-[13px] text-indigo-800 border border-indigo-100">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span><strong>Candidate:</strong> {selectedEvent.candidateName} · {selectedEvent.candidateEmail}</span>
                        </div>
                    )}

                    {/* Creating: select candidate */}
                    {isPrivileged && !selectedEvent && (
                        <div className="relative" ref={candRef}>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Candidate <span className="text-red-400">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setCandDropOpen(o => !o)}
                                className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors text-sm"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className={`truncate ${selectedCandName ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                                        {selectedCandName ?? "— Select candidate —"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {formData.candidateId && (
                                        <span
                                            onClick={e => { e.stopPropagation(); set({ candidateId: "" }); }}
                                            className="w-4 h-4 flex items-center justify-center hover:bg-slate-200 rounded-full cursor-pointer"
                                        >
                                            <X className="w-3 h-3 text-slate-400" />
                                        </span>
                                    )}
                                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${candDropOpen ? "rotate-[270deg]" : "rotate-90"}`} />
                                </div>
                            </button>

                            {candDropOpen && (
                                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 shadow-2xl rounded-xl z-[70] overflow-hidden">
                                    <div className="p-2 border-b border-slate-100 relative">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search by name or email..."
                                            className="w-full text-[13px] pl-2.5 pr-7 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50"
                                            value={candSearch}
                                            onChange={e => setCandSearch(e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                        {candSearch && (
                                            <X
                                                className="w-3.5 h-3.5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600"
                                                onClick={e => { e.stopPropagation(); setCandSearch(""); }}
                                            />
                                        )}
                                    </div>
                                    <div className="max-h-44 overflow-y-auto py-1">
                                        {filteredCands.map(c => (
                                            <div
                                                key={c.id}
                                                className={`px-3 py-2 text-[13px] hover:bg-slate-50 cursor-pointer ${formData.candidateId === c.id ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700"}`}
                                                onClick={() => { set({ candidateId: c.id }); setCandDropOpen(false); setCandSearch(""); }}
                                            >
                                                <div className="font-medium truncate">{c.name}</div>
                                                <div className="text-[11px] text-slate-400 truncate">{c.email}</div>
                                            </div>
                                        ))}
                                        {filteredCands.length === 0 && (
                                            <div className="px-3 py-3 text-[12px] text-slate-400 italic text-center">No candidates found</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Company name */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition"
                            value={formData.companyName}
                            onChange={e => set({ companyName: e.target.value })}
                            placeholder="e.g. Google, Microsoft"
                        />
                    </div>

                    {/* Interview type */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Interview Type</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition pr-8 cursor-pointer"
                                value={formData.interviewType}
                                onChange={e => set({ interviewType: e.target.value })}
                            >
                                <optgroup label="Default Types">
                                    {INTERVIEW_TYPES.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </optgroup>
                                {customTypes.length > 0 && (
                                    <optgroup label="Custom Types">
                                        {customTypes.map(ct => (
                                            <option key={ct.id} value={ct.name}>{ct.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                        </div>
                    </div>

                    {formData.interviewType === "Other" && (
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Specify Type</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition"
                                value={formData.otherInterviewType}
                                onChange={e => set({ otherInterviewType: e.target.value })}
                                placeholder="e.g. Behavioral, Onsite"
                            />
                        </div>
                    )}

                    {/* Date / Time grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <DateTimeRow
                            dateLabel="Start Date" timeLabel="Start Time"
                            dateVal={formData.startDate} timeVal={formData.startTime}
                            onDateChange={e => set({ startDate: e.target.value, endDate: e.target.value })}
                            onTimeChange={e => set({ startTime: e.target.value })}
                        />
                        <DateTimeRow
                            dateLabel="End Date" timeLabel="End Time"
                            dateVal={formData.endDate} timeVal={formData.endTime}
                            onDateChange={e => set({ endDate: e.target.value })}
                            onTimeChange={e => set({ endTime: e.target.value })}
                        />
                    </div>

                    {/* Comments */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Notes / Comments</label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition resize-none"
                            value={formData.comments}
                            onChange={e => set({ comments: e.target.value })}
                            placeholder={
                                isPrivileged
                                    ? "Add meeting links, agenda, or candidate instructions..."
                                    : "Paste email content, add your availability or meeting links..."
                            }
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
                        {selectedEvent ? (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        ) : <div />}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-all flex items-center gap-1.5"
                            >
                                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {selectedEvent ? "Save Changes" : "Schedule"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EventModal;
