import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: false,
    retries: 2,
    use: {
        baseURL: "http://localhost:5173",
        trace: "on-first-retry",
    },
    webServer: [
        {
            command: "pnpm --filter server start:e2e",
            port: 7001,
            timeout: 120 * 1000,
            reuseExistingServer: !process.env.CI,
            env: { NODE_ENV: "e2e" },
        },
        {
            command: "pnpm --filter front preview --host 0.0.0.0 --port 5173",
            port: 5173,
            timeout: 120 * 1000,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
