import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "../api/auth";

interface UserState {
    user: User | null;
    setUser: (u: User | null) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                setUser: (u) => set({ user: u }),
                logout: () => {
                    localStorage.removeItem("token");
                    set({ user: null });
                    window.location.href = "/login";
                },
            }),
            { name: "user-store" } // localStorage key
        ),
        { name: "user-store-devtools" }
    )
);
