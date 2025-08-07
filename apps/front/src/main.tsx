import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { useUserStore } from "./stores/user";
import { authApi } from "./api/auth";
import { router } from "./router";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

async function bootstrap() {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const user = await authApi.me();
      useUserStore.getState().setUser(user);
    } catch {
      useUserStore.getState().logout();
    }
  }
}

bootstrap().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  );
});