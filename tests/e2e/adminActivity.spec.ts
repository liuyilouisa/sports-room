import { test, expect, Page } from "@playwright/test";

const adminEmail = "admin@test.com";
const adminPwd = "123456";

/* ========== 工具：登录 ========== */
async function login(page: Page) {
    await page.goto("/login");
    await page.getByLabel("邮箱").fill(adminEmail);
    await page.getByLabel("密码").fill(adminPwd);
    await page.getByRole("button", { name: "登录" }).click();
    await page.waitForURL("/");
}

/* ========== 工具：创建干净活动并返回 id ========== */
async function createCleanActivity(page: Page): Promise<number> {
    await login(page);
    await page.goto("/admin/activities");
    await page.getByRole("button", { name: "新建" }).click();

    const title = "AdminE2E-" + Date.now();
    await page.getByLabel("标题").fill(title);
    await page.getByLabel("描述").fill("零脏数据专用");
    await page.getByLabel("人数上限").fill("20");
    await page.getByLabel("开始时间").fill("2024-08-07T19:00");
    await page.getByLabel("结束时间").fill("2024-08-07T21:00");

    const [resp] = await Promise.all([
        page.waitForResponse(
            (r) => r.url().includes("/admin/activities") && r.status() === 201
        ),
        page.getByRole("button", { name: "保存" }).click(),
    ]);

    const { id } = await resp.json();
    return id;
}

/* ========== 工具：删除指定活动 ========== */
async function deleteActivity(page: Page, id: number) {
    await login(page);
    await page.goto("/admin/activities");

    const row = page.locator("tr").filter({ hasText: String(id) });
    await row.getByRole("button", { name: "删除" }).click();

    await page.waitForResponse(
        (r) => r.url().includes(`/admin/activities/${id}`) && r.status() === 204
    );
}

/* ========== 用例：创建 ========== */
test("管理员创建活动必须填写开始时间", async ({ page }) => {
    await login(page);
    await page.goto("/admin/activities");

    await page.getByRole("button", { name: "新建" }).click();
    await page.getByLabel("标题").fill("缺开始时间活动");
    await page.getByLabel("描述").fill("描述");
    await page.getByLabel("人数上限").fill("10");
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page.getByText(/开始时间不能为空/i)).toBeVisible();
});

test("管理员可成功创建带开始时间的活动", async ({ page }) => {
    const id = await createCleanActivity(page);
    try {
        await expect(page.getByText("AdminE2E-")).toBeVisible();
        await expect(
            page.locator("td").filter({ hasText: /8\/7\/2024, 7:00:00 PM/ })
        ).toBeVisible();
    } finally {
        await deleteActivity(page, id);
    }
});

/* ========== 用例：编辑 ========== */
test("管理员可修改活动的开始时间", async ({ page }) => {
    const id = await createCleanActivity(page);
    try {
        await page.getByRole("button", { name: "编辑" }).first().click();
        await page.getByLabel("开始时间").fill("2024-08-08T09:00");

        await Promise.all([
            page.waitForResponse(
                (r) =>
                    r.url().includes(`/admin/activities/${id}`) &&
                    r.status() === 200
            ),
            page.getByRole("button", { name: "保存" }).click(),
        ]);

        await expect(
            page.locator("td").filter({ hasText: /8\/8\/2024, 9:00:00 AM/ })
        ).toBeVisible();
    } finally {
        await deleteActivity(page, id);
    }
});

/* ========== 用例：删除 ========== */
test("管理员可删除活动", async ({ page }) => {
    const id = await createCleanActivity(page);
    await page.getByRole("button", { name: "删除" }).first().click();
    await page.waitForResponse(
        (r) => r.url().includes(`/admin/activities/${id}`) && r.status() === 204
    );
    await page.reload();
    await expect(page.locator("table tbody tr")).toHaveCount(0);
});
