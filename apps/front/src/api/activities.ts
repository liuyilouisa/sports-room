import client from "./client";

export interface Activity {
  id: number;
  title: string;
  description: string;
  capacity: number;
  status: 'draft' | 'published';
  startAt: string;
  endAt: string | null;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
    data: T[];
    total: number;
    page: number;
    size: number;
}

export interface SearchParams {
    keyword?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export const getActivities = async (
    params: SearchParams
): Promise<Paginated<Activity>> => {
    const { data } = await client.get("/api/activities", { params });
    return data;
};

export const getActivityById = async (id: number): Promise<Activity> => {
    const { data } = await client.get(`/api/activities/${id}`);
    return data;
};
