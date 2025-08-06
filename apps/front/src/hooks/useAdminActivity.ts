import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createActivity,
    listActivities,
    updateActivity,
    deleteActivity,
} from "../api/adminActivity";

const KEYS = {
    list: (page: number, size: number) =>
        ["admin-activities", page, size] as const,
};

export const useListActivities = (page = 1, size = 20) =>
    useQuery({
        queryKey: KEYS.list(page, size),
        queryFn: () => listActivities(page, size).then((r) => r.data),
    });

export const useCreateActivity = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createActivity,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["admin-activities"] }),
    });
};

export const useUpdateActivity = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Parameters<typeof updateActivity>[1];
        }) => updateActivity(id, data),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["admin-activities"] }),
    });
};

export const useDeleteActivity = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteActivity,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["admin-activities"] }),
    });
};
