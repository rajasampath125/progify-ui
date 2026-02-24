/**
 * EmptyState
 * Consistent empty state with SVG illustration and optional action button.
 *
 * Props:
 *   title       — main heading (required)
 *   description — sub text (optional)
 *   action      — { label, onClick } (optional)
 *   icon        — 'jobs' | 'users' | 'search' | 'inbox' (default 'inbox')
 */

const illustrations = {
    jobs: (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-32">
            <rect x="30" y="40" width="140" height="90" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
            <rect x="50" y="20" width="100" height="30" rx="6" fill="#E0E7FF" stroke="#A5B4FC" strokeWidth="2" />
            <rect x="48" y="60" width="64" height="8" rx="4" fill="#A5B4FC" />
            <rect x="48" y="76" width="104" height="6" rx="3" fill="#C7D2FE" />
            <rect x="48" y="90" width="80" height="6" rx="3" fill="#C7D2FE" />
            <rect x="48" y="104" width="50" height="6" rx="3" fill="#E0E7FF" />
            <circle cx="156" cy="112" r="20" fill="#4F46E5" />
            <path d="M148 112h16M156 104v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    ),
    users: (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-32">
            <circle cx="100" cy="58" r="28" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
            <circle cx="100" cy="52" r="14" fill="#C7D2FE" />
            <path d="M60 130c0-22 18-36 40-36s40 14 40 36" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" fill="#EEF2FF" />
            <circle cx="148" cy="72" r="18" fill="#4F46E5" />
            <path d="M141 72h14M148 65v14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    ),
    search: (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-32">
            <circle cx="88" cy="76" r="40" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
            <circle cx="88" cy="76" r="26" fill="#E0E7FF" stroke="#A5B4FC" strokeWidth="2" />
            <line x1="118" y1="104" x2="145" y2="130" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
            <path d="M78 76h20M88 66v20" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    ),
    inbox: (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-32">
            <rect x="30" y="50" width="140" height="90" rx="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
            <path d="M30 70l70 45 70-45" stroke="#A5B4FC" strokeWidth="2" />
            <path d="M60 50V35a6 6 0 016-6h68a6 6 0 016 6v15" stroke="#C7D2FE" strokeWidth="2" />
            <rect x="80" y="24" width="40" height="6" rx="3" fill="#C7D2FE" />
        </svg>
    ),
};

const EmptyState = ({
    title = "Nothing here yet",
    description = "No records match your current filters.",
    action,
    icon = "inbox",
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
            <div className="mb-4 opacity-90">
                {illustrations[icon] ?? illustrations.inbox}
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-xs">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
