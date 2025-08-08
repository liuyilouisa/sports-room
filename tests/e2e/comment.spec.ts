import { test, expect, Page, Browser } from "@playwright/test";

const admin = { email: "admin@test.com", pwd: "123456" };
const user = { email: "user@comment.com", pwd: "123456", name: "CommentUser" };

/* ========== 工具：登录 ========== */
async function login(p: Page, email: string, pwd: string) {
    await p.goto("/login");
    await p.getByLabel("邮箱").fill(email);
    await p.getByLabel("密码").fill(pwd);
    await p.getByRole("button", { name: "登录" }).click();
    await p.waitForURL("/");
}

/* ========== 工具：创建一条干净的活动 ========== */
async function createCleanActivity(browser: Browser): Promise<number> {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, admin.email, admin.pwd);

    await page.goto("/admin/activities");
    await page.getByRole("button", { name: "新建" }).click();

    const title = "测试活动-评论-" + Date.now(); // 唯一标题
    await page.getByLabel("标题").fill(title);
    await page.getByLabel("描述").fill("用于 e2e 评论测试");
    await page.getByLabel("人数上限").fill("100");
    await page.getByLabel("开始时间").fill("2024-08-08T19:00");
    await page.getByLabel("结束时间").fill("2024-08-08T21:00");

    const [resp] = await Promise.all([
        page.waitForResponse(
            (r) => r.url().includes("/admin/activities") && r.status() === 201
        ),
        page.getByRole("button", { name: "保存" }).click(),
    ]);
    const { id } = await resp.json();
    await ctx.close();
    return id;
}

/* ========== 每个用例开始：清 cookie ========== */
test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
});

/* ========== 用例 ========== */
test.describe("评论功能 e2e", () => {
    test("未登录用户看不到评论框且无法评论", async ({ page, browser }) => {
        const id = await createCleanActivity(browser);
        await page.goto(`/activities/${id}`);
        await expect(page.getByPlaceholder(/写下你的评论/)).toBeHidden();
    });

    test("登录后发表评论成功", async ({ page, browser }) => {
        const id = await createCleanActivity(browser);
        await login(page, admin.email, admin.pwd);
        await page.goto(`/activities/${id}`);

        const content = "第一条评论 " + Date.now();
        await page.getByPlaceholder(/写下你的评论/).fill(content);
        await Promise.all([
            page.waitForResponse(
                (r) => r.url().includes("/comments") && r.status() === 201
            ),
            page.getByRole("button", { name: "发表" }).click(),
        ]);
        await expect(page.getByText(content)).toBeVisible();
    });

    test("字符数校验：空内容阻止提交", async ({ page, browser }) => {
        const id = await createCleanActivity(browser);
        await login(page, admin.email, admin.pwd);
        await page.goto(`/activities/${id}`);
        await expect(page.getByRole("button", { name: "发表" })).toBeDisabled();
    });

    test("字符数校验：超长内容前端截断", async ({ page, browser }) => {
        const id = await createCleanActivity(browser);
        await login(page, admin.email, admin.pwd);
        await page.goto(`/activities/${id}`);
        const long = "a".repeat(600);
        await page.getByPlaceholder(/写下你的评论/).fill(long);
        await expect(page.getByRole("button", { name: "发表" })).toBeDisabled();
    });

    test("楼中楼回复", async ({ page, browser }) => {
        const id = await createCleanActivity(browser);
        await login(page, admin.email, admin.pwd);
        await page.goto(`/activities/${id}`);

        // 先发一条主评论
        const main = "主楼 " + Date.now();
        await page.getByPlaceholder(/写下你的评论/).fill(main);
        await Promise.all([
            page.waitForResponse(
                (r) => r.url().includes("/comments") && r.status() === 201
            ),
            page.getByRole("button", { name: "发表" }).click(),
        ]);
        await expect(page.getByText(main)).toBeVisible();

        // 楼中楼回复
        const reply = "回复 " + Date.now();
        await page.getByRole("button", { name: "回复" }).first().click();
        await page.getByPlaceholder(/回复/).fill(reply);
        await Promise.all([
            page.waitForResponse(
                (r) => r.url().includes("/comments") && r.status() === 201
            ),
            page.getByRole("button", { name: "发表" }).nth(1).click(),
        ]);
        await expect(page.getByText(reply)).toBeVisible();
    });

    test("删除自己的评论", async ({ page, browser }) => {
        const id = await createCleanActivity(browser);
        page.on("dialog", (d) => d.accept());
        await login(page, admin.email, admin.pwd);
        await page.goto(`/activities/${id}`);

        const content = "待删除 " + Date.now();
        await page.getByPlaceholder(/写下你的评论/).fill(content);
        await Promise.all([
            page.waitForResponse(
                (r) => r.url().includes("/comments") && r.status() === 201
            ),
            page.getByRole("button", { name: "发表" }).click(),
        ]);

        await Promise.all([
            page.waitForResponse(
                (r) => r.url().includes("/comments/") && r.status() === 200
            ),
            page.getByRole("button", { name: "删除" }).first().click(),
        ]);
        await expect(page.getByText(content)).toBeHidden();
    });

    test("分页加载更多评论", async ({ page, browser }) => {
        const id = await createCleanActivity(browser);
        await login(page, admin.email, admin.pwd);
        await page.goto(`/activities/${id}`);

        // 精确灌 25 条
        for (let i = 0; i < 25; i++) {
            const content = `批量评论 ${i}`;
            await page.getByPlaceholder(/写下你的评论/).fill(content);
            await Promise.all([
                page.waitForResponse(
                    (r) => r.url().includes("/comments") && r.status() === 201
                ),
                page.getByRole("button", { name: "发表" }).click(),
            ]);
        }

        // 首次渲染 20 条
        await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(
            20
        );

        // 滚到底触发下一页
        const footer = page.locator('[data-testid="comment-list-end"]');
        await footer.scrollIntoViewIfNeeded();
        await page.waitForLoadState("networkidle");
        await expect(page.locator('[data-testid="comment-item"]')).toHaveCount(
            25
        );
    });

    test("折叠超长内容", async ({ page, browser }) => {
        const id = await createCleanActivity(browser);
        await login(page, admin.email, admin.pwd);
        await page.goto(`/activities/${id}`);

        const long = "超长".repeat(100);
        await page.getByPlaceholder(/写下你的评论/).fill(long);
        await Promise.all([
            page.waitForResponse(
                (r) => r.url().includes("/comments") && r.status() === 201
            ),
            page.getByRole("button", { name: "发表" }).click(),
        ]);

        await expect(page.getByText(/展开/)).toBeVisible();
        await page.getByText(/展开/).click();
        await expect(page.getByText(/收起/)).toBeVisible();
    });
});
