/**
 * useCalendarData.js
 * Custom hook — owns all data fetching: schedules, candidates, custom types.
 */
import { useState, useEffect, useCallback } from "react";
import {
    getSchedules,
    getCandidatesList,
    getInterviewTypes,
    createInterviewType,
    deleteInterviewType,
} from "../../../api/calendarApi";
import { useAuth } from "../../../auth/useAuth";

export const useCalendarData = () => {
    const { auth } = useAuth();
    const isPrivileged = auth?.role === "ADMIN" || auth?.role === "RECRUITER";

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [customTypes, setCustomTypes] = useState([]);

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getSchedules();
            setEvents(res.data.map(s => ({
                id: s.id,
                title: s.candidateName || "Blocked",
                start: new Date(s.startTime),
                end: new Date(s.endTime),
                resource: s,
            })));
        } catch (e) {
            console.error("Failed to load schedules", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCustomTypes = useCallback(async () => {
        try {
            const res = await getInterviewTypes();
            setCustomTypes(res.data);
        } catch (e) {
            console.error("Failed to load custom types", e);
        }
    }, []);

    useEffect(() => {
        // Fetch all data in parallel — much faster than sequential
        const fetches = [fetchSchedules(), fetchCustomTypes()];
        if (isPrivileged) {
            fetches.push(
                getCandidatesList()
                    .then(r => setCandidates(r.data))
                    .catch(e => console.error("Failed to load candidates list", e))
            );
        }
        Promise.all(fetches);
    }, [isPrivileged]); // only re-fetch if role changes, not every auth ref change

    const addCustomType = async (name, color) => {
        await createInterviewType({ name: name.trim(), color });
        await fetchCustomTypes();
    };

    const removeCustomType = async (id) => {
        await deleteInterviewType(id);
        await fetchCustomTypes();
    };

    return {
        events, loading, candidates, customTypes,
        fetchSchedules, addCustomType, removeCustomType,
    };
};
