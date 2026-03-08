/**
 * CalendarPage.jsx  (~200 lines)
 * Orchestrator — composes sub-components, owns navigation & view state.
 */
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import format from "date-fns/format";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import addWeeks from "date-fns/addWeeks";
import subWeeks from "date-fns/subWeeks";
import addDays from "date-fns/addDays";
import subDays from "date-fns/subDays";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useAuth } from "../../auth/useAuth";
import { createSchedule, updateSchedule, deleteSchedule } from "../../api/calendarApi";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, AlertCircle, X } from "lucide-react";

import Modal from "../../components/Modal";

import { useCalendarData } from "./calendar/useCalendarData";
import { localizer, TYPE_CONFIG, EMPTY_FORM, noAllDay } from "./calendar/calendarConfig";
import MiniCalendar from "./calendar/MiniCalendar";
import RightPanel from "./calendar/RightPanel";
import EventModal from "./calendar/EventModal";
import ManageTypesModal from "./calendar/ManageTypesModal";

// ── Per-type event styling ─────────────────────────────────────────────────────
const buildEventProps = (allTypeConfig) => (event) => {
    const isPast = event.end < new Date(Date.now() - 3600000);
    const t = event.resource.ownerOrAdmin ? event.resource.interviewType : "Blocked";
    const cfg = allTypeConfig[t] ?? allTypeConfig.Other;
    return {
        style: {
            backgroundColor: cfg.bg,
            color: cfg.text,
            border: "none",
            borderLeft: `3px solid ${cfg.border}`,
            borderRadius: "6px",
            padding: "3px 6px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
            opacity: isPast ? 0.45 : 1,
            pointerEvents: isPast ? "none" : "auto", // prevent clicking past events
        }
    };
};

// ── Event block inner content ──────────────────────────────────────────────────
const EventBlock = ({ event, allTypeConfig }) => {
    const isPast = event.end < new Date(Date.now() - 3600000);
    const t = event.resource.ownerOrAdmin ? event.resource.interviewType : "Blocked";
    const cfg = allTypeConfig[t] ?? allTypeConfig.Other;
    return (
        <div className="flex flex-col w-full h-full overflow-hidden gap-px">
            <span className={`font-semibold truncate leading-tight ${isPast ? "line-through opacity-80" : ""}`} style={{ color: cfg.text }}>
                {event.resource.ownerOrAdmin ? (event.resource.candidateName || "Me") : "Blocked"}
            </span>
            {event.resource.ownerOrAdmin && (
                <>
                    <span className={`truncate leading-tight opacity-75 text-[10px] ${isPast ? "line-through" : ""}`} style={{ color: cfg.text }}>
                        {event.resource.companyName}
                    </span>
                    <span className={`uppercase tracking-widest opacity-50 text-[9px] font-bold ${isPast ? "line-through" : ""}`} style={{ color: cfg.text }}>
                        {t}
                    </span>
                </>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
const CalendarPage = () => {
    const { auth } = useAuth();
    const isPrivileged = auth?.role === "ADMIN" || auth?.role === "RECRUITER";

    // ── Data ──────────────────────────────────────────────────────────────────
    const { events, loading, candidates, customTypes, fetchSchedules, addCustomType, removeCustomType } = useCalendarData();

    // ── Calendar nav ──────────────────────────────────────────────────────────
    const [currentView, setCurrentView] = useState("week");
    const [currentDate, setCurrentDate] = useState(new Date());

    // ── Filter ────────────────────────────────────────────────────────────────
    const [selectedFilter, setSelectedFilter] = useState("");
    const [sidebarSearch, setSidebarSearch] = useState("");
    const [sidebarDropOpen, setSidebarDropOpen] = useState(false);

    // ── Modals ────────────────────────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [manageTypesOpen, setManageTypesOpen] = useState(false);
    const [pastDateErrorOpen, setPastDateErrorOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    // ── Merged type config (defaults + custom) ────────────────────────────────
    const allTypeConfig = useMemo(() => {
        const merged = { ...TYPE_CONFIG };
        customTypes.forEach(ct => {
            merged[ct.name] = { bg: ct.color + "18", border: ct.color, text: ct.color, dot: ct.color };
        });
        return merged;
    }, [customTypes]);

    // ── Derived event list ────────────────────────────────────────────────────
    const filteredEvents = useMemo(
        () => selectedFilter ? events.filter(e => e.resource.candidateId === selectedFilter) : events,
        [events, selectedFilter]
    );

    const metrics = useMemo(() => ({
        total: filteredEvents.length,
        screening: filteredEvents.filter(e => e.resource.interviewType === "Screening").length,
        technical: filteredEvents.filter(e => e.resource.interviewType === "Technical").length,
    }), [filteredEvents]);

    // ── Navigate ──────────────────────────────────────────────────────────────
    const handleNavigate = (dir) => {
        const fns = {
            month: [subMonths, addMonths],
            week: [subWeeks, addWeeks],
            day: [subDays, addDays],
        };
        if (dir === "TODAY") return setCurrentDate(new Date());
        const [prev, next] = fns[currentView] ?? fns.day;
        setCurrentDate(dir === "PREV" ? prev(currentDate, 1) : next(currentDate, 1));
    };

    // ── Calendar label ────────────────────────────────────────────────────────
    const calLabel = useMemo(() => {
        if (currentView === "month") return format(currentDate, "MMMM yyyy");
        if (currentView === "week") {
            const start = new Date(currentDate); start.setDate(start.getDate() - start.getDay());
            const end = addDays(start, 6);
            return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
        }
        return format(currentDate, "EEEE, MMMM d, yyyy");
    }, [currentView, currentDate]);

    const refresh = useCallback(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(start);
        const startIso = format(start, "yyyy-MM-dd'T'00:00:00");
        const endIso = format(end, "yyyy-MM-dd'T'23:59:59");
        fetchSchedules(startIso, endIso);
    }, [currentDate, fetchSchedules]);

    // ── Fetch schedules based on visible range ────────────────────────────────
    useEffect(() => {
        refresh();
    }, [currentDate.getMonth(), currentDate.getFullYear(), refresh]);

    // ── Open modal helpers ────────────────────────────────────────────────────
    const openCreate = useCallback((sd = "", st = "09:00", ed = "", et = "10:00") => {
        setSelectedEvent(null);
        setFormData({ ...EMPTY_FORM, startDate: sd, startTime: st, endDate: ed, endTime: et });
        setModalOpen(true);
    }, []);

    const handleSelectSlot = (slot) => {
        if (slot.start < new Date(Date.now() - 3600000)) {
            setPastDateErrorOpen(true);
            return;
        }
        const sd = format(slot.start, "yyyy-MM-dd");
        const st = format(slot.start, "HH:mm");
        let end = slot.end;
        if (slot.start.getTime() === slot.end.getTime()) end = new Date(slot.start.getTime() + 3600000);
        openCreate(sd, st, format(end, "yyyy-MM-dd"), format(end, "HH:mm"));
    };

    const handleSelectEvent = (event) => {
        if (!event.resource.ownerOrAdmin) return;
        const s = event.resource;
        setSelectedEvent(s);
        setFormData({
            candidateId: s.candidateId || "",
            companyName: s.companyName,
            interviewType: s.interviewType,
            otherInterviewType: s.otherInterviewType || "",
            startDate: format(new Date(s.startTime), "yyyy-MM-dd"),
            startTime: format(new Date(s.startTime), "HH:mm"),
            endDate: format(new Date(s.endTime), "yyyy-MM-dd"),
            endTime: format(new Date(s.endTime), "HH:mm"),
            comments: s.comments || "",
        });
        setModalOpen(true);
    };

    // ── Save schedule ─────────────────────────────────────────────────────────
    const handleSave = async (data) => {
        try {
            if (!data.companyName.trim()) throw new Error("Company name is required");
            if (data.interviewType === "Other" && !data.otherInterviewType.trim())
                throw new Error("Please specify the 'Other' interview type");
            if (!data.startDate || !data.startTime || !data.endDate || !data.endTime)
                throw new Error("Date and time fields are required");
            const startIso = `${data.startDate}T${data.startTime}:00`;
            const endIso = `${data.endDate}T${data.endTime}:00`;
            if (new Date(startIso) < new Date()) throw new Error("Cannot schedule an interview in the past.");
            if (new Date(startIso) >= new Date(endIso)) throw new Error("End time must be after start time");
            if ((new Date(endIso) - new Date(startIso)) / 3600000 > 4) throw new Error("Block cannot exceed 4 hours");
            if (isPrivileged && !selectedEvent && !data.candidateId) throw new Error("Please select a candidate");

            const payload = selectedEvent
                ? {
                    // UPDATE: never send candidateId — backend rejects changing it
                    companyName: data.companyName,
                    interviewType: data.interviewType,
                    otherInterviewType: data.interviewType === "Other" ? data.otherInterviewType : null,
                    startTime: startIso,
                    endTime: endIso,
                    comments: data.comments || null,
                }
                : {
                    // CREATE: include candidateId for privileged users
                    ...(isPrivileged && data.candidateId ? { candidateId: data.candidateId } : {}),
                    companyName: data.companyName,
                    interviewType: data.interviewType,
                    otherInterviewType: data.interviewType === "Other" ? data.otherInterviewType : null,
                    startTime: startIso,
                    endTime: endIso,
                    comments: data.comments || null,
                };
            if (selectedEvent) await updateSchedule(selectedEvent.id, payload);
            else await createSchedule(payload);
            setModalOpen(false);
            refresh();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to schedule interview.";
            throw new Error(msg);
        }
    };

    // ── Delete schedule ───────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (!window.confirm("Delete this interview block?")) return;
        await deleteSchedule(selectedEvent.id);
        setModalOpen(false);
        refresh();
    };

    // ── Memoised RBC components ───────────────────────────────────────────────
    const rbcComponents = useMemo(() => ({ event: (p) => <EventBlock {...p} allTypeConfig={allTypeConfig} /> }), [allTypeConfig]);
    const rbcEventProps = useMemo(() => buildEventProps(allTypeConfig), [allTypeConfig]);

    // ── Left sidebar ──────────────────────────────────────────────────────────
    const [myCalOpen, setMyCalOpen] = useState(true);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden text-sm w-full border-t border-slate-200">

                {/* Left sidebar */}
                <aside className="w-[230px] shrink-0 border-r border-slate-200 hidden md:flex flex-col bg-white">
                    <div className="p-3 border-b border-slate-100">
                        <button
                            onClick={() => openCreate(format(new Date(), "yyyy-MM-dd"), format(new Date(), "HH:mm"), format(new Date(), "yyyy-MM-dd"), format(addDays(new Date(), 0), "HH:mm"))}
                            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm shadow-indigo-200"
                        >
                            <Plus className="w-4 h-4" /> New Event
                        </button>
                    </div>

                    <MiniCalendar currentDate={currentDate} onSelectDay={(d) => { setCurrentDate(d); setCurrentView("day"); }} />

                    <div className="p-3 flex-1 overflow-y-auto">
                        <button
                            onClick={() => setMyCalOpen(o => !o)}
                            className="w-full flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 hover:text-slate-900 transition-colors"
                        >
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${myCalOpen ? "rotate-90" : ""}`} />
                            My Calendars
                        </button>
                        {myCalOpen && (
                            <div className="flex flex-col gap-1.5 pl-4">
                                {[
                                    { color: "#3b82f6", label: "Technical Syncs" },
                                    { color: "#a855f7", label: "Recruiter Syncs" },
                                    { color: "#f59e0b", label: "Screening Syncs" },
                                ].map(({ color, label }) => (
                                    <div key={label} className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer hover:text-slate-900">
                                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                    {/* Toolbar */}
                    <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 shrink-0 gap-2">
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-slate-900 text-base hidden lg:block mr-1">Calendar</span>
                            <button
                                onClick={() => handleNavigate("TODAY")}
                                className="text-[13px] font-medium text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                            >
                                Today
                            </button>
                            <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden">
                                <button onClick={() => handleNavigate("PREV")} className="px-2 py-1.5 hover:bg-slate-200 transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                </button>
                                <button onClick={() => handleNavigate("NEXT")} className="px-2 py-1.5 hover:bg-slate-200 transition-colors">
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                            <span className="font-semibold text-slate-800 text-[15px] tracking-tight hidden sm:block">{calLabel}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                            <div className="relative flex items-center border border-slate-200 bg-white rounded-lg hover:bg-slate-50 cursor-pointer">
                                <CalendarIcon className="w-3.5 h-3.5 absolute left-2.5 pointer-events-none text-indigo-500" />
                                <select
                                    value={currentView}
                                    onChange={e => setCurrentView(e.target.value)}
                                    className="appearance-none text-[13px] font-medium bg-transparent py-1.5 pl-8 pr-7 outline-none cursor-pointer"
                                >
                                    <option value="day">Day</option>
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                </select>
                                <ChevronRight className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none rotate-90" />
                            </div>
                            <button
                                onClick={() => openCreate(format(new Date(), "yyyy-MM-dd"), format(new Date(), "HH:mm"), format(addDays(new Date(), 0), "yyyy-MM-dd"), format(new Date(Date.now() + 3600000), "HH:mm"))}
                                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-sm font-semibold transition-all text-[13px]"
                            >
                                <Plus className="w-3.5 h-3.5" /> New
                            </button>
                        </div>
                    </header>

                    {/* Calendar grid */}
                    <div className="flex-1 p-3 overflow-hidden flex flex-col bg-slate-50">
                        <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <Calendar
                                localizer={localizer}
                                events={filteredEvents}
                                startAccessor="start"
                                endAccessor="end"
                                allDayAccessor={noAllDay}
                                style={{ height: "100%" }}
                                selectable
                                onSelectSlot={handleSelectSlot}
                                onSelectEvent={handleSelectEvent}
                                eventPropGetter={rbcEventProps}
                                components={rbcComponents}
                                views={["month", "week", "day"]}
                                view={currentView}
                                onView={setCurrentView}
                                date={currentDate}
                                onNavigate={setCurrentDate}
                                toolbar={false}
                                step={30}
                                timeslots={2}
                                showMultiDayTimes
                            />
                        </div>
                    </div>
                </div>

                {/* Right analytics sidebar */}
                {isPrivileged && (
                    <RightPanel
                        candidates={candidates}
                        selectedCandidateFilter={selectedFilter}
                        onFilterChange={setSelectedFilter}
                        sidebarSearch={sidebarSearch}
                        onSidebarSearchChange={setSidebarSearch}
                        sidebarDropOpen={sidebarDropOpen}
                        onSidebarDropToggle={() => setSidebarDropOpen(o => !o)}
                        allTypeConfig={allTypeConfig}
                        metrics={metrics}
                        onManageTypes={() => setManageTypesOpen(true)}
                        isPrivileged={isPrivileged}
                    />
                )}
            </div>

            {/* Schedule event modal */}
            {modalOpen && (
                <EventModal
                    selectedEvent={selectedEvent}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={() => setModalOpen(false)}
                    candidates={candidates}
                    customTypes={customTypes}
                    isPrivileged={isPrivileged}
                />
            )}

            {/* Manage types modal */}
            {manageTypesOpen && (
                <ManageTypesModal
                    customTypes={customTypes}
                    onAdd={addCustomType}
                    onDelete={removeCustomType}
                    onClose={() => setManageTypesOpen(false)}
                />
            )}

            {/* Past Date Error Modal (Tailwind custom overlay instead of generic Modal) */}
            {pastDateErrorOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="p-6 rounded-2xl bg-white max-w-sm w-full mx-auto shadow-2xl relative shadow-indigo-900/10 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setPastDateErrorOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Invalid Selection</h3>
                            <p className="text-sm text-slate-500 mb-6 px-2">
                                You cannot schedule an interview for a time slot that has already passed.
                            </p>
                            <button
                                onClick={() => setPastDateErrorOpen(false)}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CalendarPage;
