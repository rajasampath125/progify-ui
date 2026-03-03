/**
 * RightPanel.jsx
 * The right analytics sidebar: candidate filter dropdown + metrics cards + type legend.
 */
import React, { useMemo, useRef, useEffect } from "react";
import { FilterIcon, X, ChevronRight, Users, CalendarIcon as CalendarIconLucide, Clock, BarChart2, Settings } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { TYPE_CONFIG } from "./calendarConfig";

const METRIC_CARDS = [
    { key: "total", label: "Total Blocks", color: "indigo", Icon: CalendarIcon },
    { key: "screening", label: "Screening", color: "amber", Icon: Clock },
    { key: "technical", label: "Technical", color: "blue", Icon: BarChart2 },
];

const COLOR_MAP = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-500", val: "text-indigo-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-500", val: "text-amber-700" },
    blue: { bg: "bg-blue-50", text: "text-blue-500", val: "text-blue-700" },
};

const RightPanel = ({
    candidates,
    selectedCandidateFilter,
    onFilterChange,
    sidebarSearch,
    onSidebarSearchChange,
    sidebarDropOpen,
    onSidebarDropToggle,
    allTypeConfig,
    metrics,
    onManageTypes,
    isPrivileged,
}) => {
    const dropdownRef = useRef(null);

    const filteredCandidates = useMemo(
        () => candidates.filter(c => c.name.toLowerCase().includes(sidebarSearch.toLowerCase())),
        [candidates, sidebarSearch]
    );

    const selectedName = selectedCandidateFilter
        ? candidates.find(c => c.id === selectedCandidateFilter)?.name ?? "Unknown"
        : "All Candidates";

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                if (sidebarDropOpen) onSidebarDropToggle();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [sidebarDropOpen]);

    return (
        <aside className="w-[256px] shrink-0 border-l border-slate-200 hidden xl:flex flex-col bg-white overflow-y-auto">
            <div className="p-4 flex flex-col gap-3">

                {/* ── Filter dropdown ──────────────────────────────────────── */}
                <div className="relative" ref={dropdownRef}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Filter Dashboard
                    </p>
                    <button
                        onClick={onSidebarDropToggle}
                        className="w-full flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <FilterIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="text-[13px] font-medium text-slate-700 truncate">{selectedName}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                            {selectedCandidateFilter && (
                                <span
                                    onClick={e => { e.stopPropagation(); onFilterChange(""); onSidebarSearchChange(""); }}
                                    className="w-4 h-4 flex items-center justify-center hover:bg-slate-200 rounded-full cursor-pointer"
                                >
                                    <X className="w-3 h-3 text-slate-500" />
                                </span>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${sidebarDropOpen ? "rotate-[270deg]" : "rotate-90"}`} />
                        </div>
                    </button>

                    {sidebarDropOpen && (
                        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
                            <div className="p-2 border-b border-slate-100 relative">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search candidates..."
                                    className="w-full text-[13px] pl-2.5 pr-7 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50"
                                    value={sidebarSearch}
                                    onChange={e => onSidebarSearchChange(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                />
                                {sidebarSearch && (
                                    <X
                                        className="w-3.5 h-3.5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:text-slate-600"
                                        onClick={e => { e.stopPropagation(); onSidebarSearchChange(""); }}
                                    />
                                )}
                            </div>
                            <div className="max-h-52 overflow-y-auto py-1">
                                {!sidebarSearch && (
                                    <div
                                        className={`px-3 py-2 text-[13px] hover:bg-slate-50 cursor-pointer flex items-center gap-2 ${!selectedCandidateFilter ? "text-indigo-700 font-semibold bg-indigo-50" : "text-slate-700"}`}
                                        onClick={() => { onFilterChange(""); onSidebarDropToggle(); onSidebarSearchChange(""); }}
                                    >
                                        <Users className="w-3.5 h-3.5 shrink-0" />
                                        All Candidates
                                    </div>
                                )}
                                {filteredCandidates.map(c => (
                                    <div
                                        key={c.id}
                                        className={`px-3 py-2 text-[13px] hover:bg-slate-50 cursor-pointer truncate ${selectedCandidateFilter === c.id ? "text-indigo-700 font-semibold bg-indigo-50" : "text-slate-700"}`}
                                        onClick={() => { onFilterChange(c.id); onSidebarDropToggle(); onSidebarSearchChange(""); }}
                                    >
                                        {c.name}
                                    </div>
                                ))}
                                {filteredCandidates.length === 0 && (
                                    <div className="px-3 py-3 text-[12px] text-slate-400 italic text-center">No candidates found</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-px bg-slate-100" />

                {/* ── Metric cards ─────────────────────────────────────────── */}
                {METRIC_CARDS.map(({ key, label, color, Icon }) => {
                    const c = COLOR_MAP[color];
                    return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-white">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                                <p className={`text-2xl font-bold ${c.val} leading-none`}>{metrics[key]}</p>
                            </div>
                            <div className={`${c.bg} p-2.5 rounded-lg ${c.text}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                        </div>
                    );
                })}

                {/* ── Event type legend ────────────────────────────────────── */}
                <div className="mt-1">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Types</p>
                        {isPrivileged && (
                            <button
                                onClick={onManageTypes}
                                className="flex items-center gap-1 text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                            >
                                <Settings className="w-3 h-3" />
                                Manage
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {Object.entries(allTypeConfig).filter(([k]) => k !== "Blocked").map(([type, cfg]) => (
                            <div key={type} className="flex items-center gap-2 text-[12px] text-slate-600">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                                {type}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default RightPanel;
