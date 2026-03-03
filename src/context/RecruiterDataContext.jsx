/**
 * RecruiterDataContext.jsx  — singleton module-level cache
 *
 * Data (jobs + jobCandidatesMap) is stored at MODULE scope so all
 * recruiter pages share the same cache across navigations, regardless
 * of how many <RecruiterDataProvider> instances exist.
 *
 * Usage in a page:
 *   const { jobs, jobCandidatesMap, loading, error } = useRecruiterData();
 *   useEffect(() => { ensureLoaded(); }, []);
 *
 * After mutations:
 *   invalidateRecruiterCache();
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getRecruiterJobs, getAllJobsCandidates } from "../api/recruiterApi";

// ── Module-level singleton cache ───────────────────────────────────────────────
let _cache = null;          // { jobs, jobCandidatesMap }
let _promise = null;        // in-flight fetch promise (deduplication)

async function _fetch() {
    if (_promise) return _promise;
    _promise = Promise.all([getRecruiterJobs(), getAllJobsCandidates()])
        .then(([j, c]) => {
            _cache = { jobs: j.data || [], jobCandidatesMap: c.data || {} };
            _promise = null;
            return _cache;
        })
        .catch(err => {
            _promise = null;
            throw err;
        });
    return _promise;
}

/** Call after any mutation to force re-fetch next time */
export function invalidateRecruiterCache() {
    _cache = null;
    _promise = null;
}

// ── React context plumbing ─────────────────────────────────────────────────────
const RecruiterDataContext = createContext(null);

export function RecruiterDataProvider({ children }) {
    const [data, setData] = useState(_cache);  // start from cache if available
    const [loading, setLoading] = useState(!_cache);
    const [error, setError] = useState("");

    const ensureLoaded = useCallback(async (force = false) => {
        if (_cache && !force) {
            setData(_cache);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            if (force) { _cache = null; _promise = null; }
            const result = await _fetch();
            setData(result);
        } catch (err) {
            console.error("RecruiterData fetch failed", err);
            setError(!err.response
                ? "Network Error: Backend server is unreachable."
                : "Failed to load recruiter data."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const invalidate = useCallback(() => {
        invalidateRecruiterCache();
        ensureLoaded(true);
    }, [ensureLoaded]);

    const value = useMemo(() => ({
        jobs: data?.jobs || [],
        jobCandidatesMap: data?.jobCandidatesMap || {},
        loading,
        error,
        ensureLoaded,
        invalidate,
    }), [data, loading, error, ensureLoaded, invalidate]);

    return (
        <RecruiterDataContext.Provider value={value}>
            {children}
        </RecruiterDataContext.Provider>
    );
}

export function useRecruiterData() {
    const ctx = useContext(RecruiterDataContext);
    if (!ctx) throw new Error("useRecruiterData must be used inside <RecruiterDataProvider>");
    return ctx;
}
