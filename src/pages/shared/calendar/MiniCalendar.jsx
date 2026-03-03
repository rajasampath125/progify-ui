/**
 * MiniCalendar.jsx
 * Left-sidebar mini calendar with month navigation and day selection.
 */
import React, { useState, useEffect } from "react";
import format from "date-fns/format";
import addDays from "date-fns/addDays";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import isSameMonth from "date-fns/isSameMonth";
import isSameDay from "date-fns/isSameDay";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_LABELS = ["S", "M", "T", "W", "Th", "F", "S"];

const MiniCalendar = ({ currentDate, onSelectDay }) => {
    const [miniMonth, setMiniMonth] = useState(startOfMonth(currentDate));

    useEffect(() => {
        setMiniMonth(startOfMonth(currentDate));
    }, [currentDate]);

    const renderGrid = () => {
        const mStart = startOfMonth(miniMonth);
        const rows = [];
        let days = [];
        let day = startOfWeek(mStart);
        const mEnd = endOfWeek(endOfMonth(mStart));

        while (day <= mEnd) {
            for (let i = 0; i < 7; i++) {
                const d = day;
                const inMonth = isSameMonth(d, mStart);
                const isSelected = isSameDay(d, currentDate);
                const isToday = isSameDay(d, new Date());
                days.push(
                    <div
                        key={d.toISOString()}
                        onClick={() => onSelectDay(d)}
                        className={`
                            w-6 h-6 mx-auto flex items-center justify-center text-[11px]
                            rounded-full cursor-pointer transition-all
                            ${!inMonth ? "text-slate-300" : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"}
                            ${isSelected && !isToday ? "bg-indigo-100 text-indigo-700 font-semibold" : ""}
                            ${isToday ? "bg-indigo-600 text-white font-bold hover:bg-indigo-700" : ""}
                        `}
                    >
                        {format(d, "d")}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toISOString()} className="grid grid-cols-7 gap-y-1 mb-1">
                    {days}
                </div>
            );
            days = [];
        }
        return rows;
    };

    return (
        <div className="p-3 border-b border-slate-100">
            {/* Month nav header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 tracking-wide">
                    {format(miniMonth, "MMMM yyyy")}
                </span>
                <div className="flex gap-0.5">
                    <button
                        onClick={() => setMiniMonth(m => subMonths(m, 1))}
                        className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                        onClick={() => setMiniMonth(m => addMonths(m, 1))}
                        className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Day-of-week labels */}
            <div className="grid grid-cols-7 gap-y-1 mb-1">
                {DAY_LABELS.map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase">{d}</div>
                ))}
            </div>

            {renderGrid()}
        </div>
    );
};

export default MiniCalendar;
