import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    retries: 2,
    use: {
        baseURL: "http://localhost:5173",
        trace: "on-first-retry",
    },
    webServer: {
        command: "pnpm ci:start",
        port: 5173,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
