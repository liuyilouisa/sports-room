import axios from "./client";
import type {
    CreateActivityDTO,
    UpdateActivityDTO,
} from "../schemas/adminActivity";

export interface AdminActivity {
    id: number;
    title: string;
    description: string;
    capacity: number;
    status: "draft" | "published";
    createdAt: string;
    updatedAt: string;
}

export interface Page<T> {
    data: T[];
    total: number;
}

export const createActivity = (data: CreateActivityDTO) =>
    axios.post<AdminActivity>("/api/admin/activities", data);

export const listActivities = (page = 1, size = 20) =>
    axios.get<Page<AdminActivity>>("/api/admin/activities", {
        params: { page, size },
    });

export const updateActivity = (id: number, data: UpdateActivityDTO) =>
    axios.put<AdminActivity>(`/api/admin/activities/${id}`, data);

export const deleteActivity = (id: number) =>
    axios.delete(`/api/admin/activities/${id}`);
