/**
 * TableSkeleton
 * Renders a shimmer skeleton that mimics a data table while loading.
 *
 * Props:
 *   cols  — number of columns  (default 5)
 *   rows  — number of skeleton rows (default 6)
 *   hideHeader — hides the fake header row (default false)
 */
const TableSkeleton = ({ cols = 5, rows = 6, hideHeader = false }) => {
    return (
        <div className="animate-fade-in">
            {/* Fake table header */}
            {!hideHeader && (
                <div className="flex gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
                    {Array.from({ length: cols }).map((_, i) => (
                        <div
                            key={i}
                            className="skeleton h-3 rounded-full"
                            style={{ flex: i === 0 ? 2 : 1 }}
                        />
                    ))}
                </div>
            )}

            {/* Fake rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={rowIdx}
                    className="flex gap-4 px-6 py-4 border-b border-gray-50 items-center"
                >
                    {Array.from({ length: cols }).map((_, colIdx) => (
                        <div
                            key={colIdx}
                            className="skeleton rounded-full"
                            style={{
                                flex: colIdx === 0 ? 2 : 1,
                                height: colIdx === 0 ? "14px" : "12px",
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TableSkeleton;
