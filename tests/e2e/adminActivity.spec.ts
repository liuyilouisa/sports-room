import { test, expect } from "@playwright/test";

const adminEmail = "admin@test.com";
const adminPwd = "123456";

test.beforeEach(async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("邮箱").fill(adminEmail);
    await page.getByLabel("密码").fill(adminPwd);

    await Promise.all([
        page.waitForResponse(
            (r) => r.url().includes("/login") && r.status() === 200
        ),
        page.getByRole("button", { name: "登录" }).click(),
    ]);

    await page.goto("/admin/activities");
    await page.waitForLoadState("networkidle");
});

/* ========== 创建 ========== */
test("管理员创建活动必须填写开始时间", async ({ page }) => {
    await page.getByRole("button", { name: "新建" }).click();

    // 不填 startAt
    await page.getByLabel("标题").fill("缺开始时间活动");
    await page.getByLabel("描述").fill("描述");
    await page.getByLabel("人数上限").fill("10");
    await page.getByRole("button", { name: "保存" }).click();

    // 前端校验阻止提交
    await expect(page.getByText(/开始时间不能为空/i)).toBeVisible();
});

test("管理员可成功创建带开始时间的活动", async ({ page }) => {
    await page.getByRole("button", { name: "新建" }).click();

    await page.getByLabel("标题").fill("篮球之夜");
    await page.getByLabel("描述").fill("周三晚 19:00-21:00");
    await page.getByLabel("人数上限").fill("20");
    await page.getByLabel("开始时间").fill("2024-08-07T19:00");
    await page.getByLabel("结束时间").fill("2024-08-07T21:00");

    const createPromise = page.waitForResponse(
        (r) => r.url().includes("/admin/activities") && r.status() === 201
    );
    await page.getByRole("button", { name: "保存" }).click();
    await createPromise;

    // 列表出现
    await expect(page.locator("text=篮球之夜")).toBeVisible();
    await expect(
        page
            .locator("td")
            .filter({ hasText: /8\/7\/2024, 7:00:00 PM/ })
    ).toBeVisible();
});

/* ========== 编辑 ========== */
test("管理员可修改活动的开始时间", async ({ page }) => {
    await page.getByRole("button", { name: "编辑" }).first().click();

    await page.getByLabel("开始时间").fill("2024-08-08T09:00");

    const updatePromise = page.waitForResponse(
        (r) => r.url().includes("/admin/activities") && r.status() === 200
    );
    await page.getByRole("button", { name: "保存" }).click();
    await updatePromise;

    await expect(
        page
            .locator("td")
            .filter({ hasText: /8\/8\/2024, 9:00:00 AM/ })
    ).toBeVisible();
});

/* ========== 删除 ========== */
test("管理员可删除活动", async ({ page }) => {
    const deletePromise = page.waitForResponse(
        (r) => r.url().includes("/admin/activities") && r.status() === 204
    );
    await page.getByRole("button", { name: "删除" }).first().click();
    await deletePromise;

    await expect(page.getByText("暂无活动")).toBeVisible();
});
