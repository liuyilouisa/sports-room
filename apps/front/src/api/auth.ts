import client from "./client";

export interface RegisterDto {
    email: string;
    name: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
}

export const authApi = {
    register: (dto: RegisterDto) =>
        client.post<{ token: string; user: User }>("/api/auth/register", dto),
    login: (dto: LoginDto) =>
        client.post<{ token: string; user: User }>("/api/auth/login", dto),
    me: () => client.get<User>("/api/auth/me").then((res) => res.data),
};
