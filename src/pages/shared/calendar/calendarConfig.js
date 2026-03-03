/**
 * calendarConfig.js
 * Shared constants, type config, helpers used across calendar components.
 */
import { dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

// ── date-fns localizer ────────────────────────────────────────────────────────
export const localizer = dateFnsLocalizer({
    format, parse, startOfWeek, getDay,
    locales: { "en-US": enUS },
});

// ── Interview type config ─────────────────────────────────────────────────────
export const TYPE_CONFIG = {
    Screening: { bg: "#fefce8", border: "#f59e0b", text: "#92400e", dot: "#f59e0b" },
    Technical: { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af", dot: "#3b82f6" },
    Recruiter: { bg: "#fdf4ff", border: "#a855f7", text: "#6b21a8", dot: "#a855f7" },
    Other: { bg: "#f0fdf4", border: "#22c55e", text: "#14532d", dot: "#22c55e" },
    Blocked: { bg: "#f8fafc", border: "#cbd5e1", text: "#64748b", dot: "#94a3b8" },
};

// ── Empty form state ──────────────────────────────────────────────────────────
export const EMPTY_FORM = {
    candidateId: "",
    companyName: "",
    interviewType: "Screening",
    otherInterviewType: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    comments: "",
};

// ── Shared input class ────────────────────────────────────────────────────────
export const inputCls =
    "w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition";

// ── No-op accessor for react-big-calendar allDay ──────────────────────────────
export const noAllDay = () => "";

// ── Inject RBC overrides once ─────────────────────────────────────────────────
if (!document.getElementById("rbc-anim")) {
    const s = document.createElement("style");
    s.id = "rbc-anim";
    s.innerHTML = `
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes slideUp { from{opacity:0;transform:translateY(14px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
      .rbc-event { outline: none !important; }
      .rbc-event.rbc-selected { outline: 2px solid #6366f1 !important; outline-offset: 1px; }
      .rbc-today { background-color: #f0f4ff !important; }
      .rbc-timeslot-group { border-bottom: 1px solid #f1f5f9 !important; }
      .rbc-time-slot { border-top: 1px solid #f8fafc !important; }
      .rbc-time-header { border-bottom: 1px solid #e2e8f0 !important; }
      .rbc-header { padding: 8px 4px !important; font-size: 11px !important; font-weight: 600 !important; color: #64748b !important; text-transform: uppercase !important; letter-spacing: 0.06em !important; border-bottom: none !important; }
      .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9 !important; }
      .rbc-month-view { border: none !important; }
      .rbc-month-row + .rbc-month-row { border-top: 1px solid #f1f5f9 !important; }
      .rbc-date-cell { padding: 4px 8px !important; font-size: 12px !important; color: #475569 !important; }
      .rbc-date-cell.rbc-off-range { color: #cbd5e1 !important; }
      .rbc-date-cell.rbc-now { font-weight: 700 !important; color: #4f46e5 !important; }
      .rbc-time-content { border-top: 1px solid #e2e8f0 !important; }
      .rbc-time-gutter .rbc-timeslot-group { border: none !important; }
      .rbc-label { font-size: 10px !important; font-weight: 500 !important; color: #94a3b8 !important; padding: 0 8px !important; }
      .rbc-allday-cell { display: none !important; }
      .rbc-time-header-gutter { border-bottom: none !important; }
    `;
    document.head.appendChild(s);
}
