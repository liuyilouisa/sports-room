import { test, expect } from "@playwright/test";

const adminEmail = "admin@test.com";
const adminPwd = "123456";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");

  // 1. 填写表单
  await page.getByLabel("邮箱").fill(adminEmail);
  await page.getByLabel("密码").fill(adminPwd);

  // 2. 发起登录并等待登录成功的响应或跳转
  await Promise.all([
    page.waitForResponse((r) =>
      r.url().includes("/login") && r.status() === 200
    ), 
    page.getByRole("button", { name: "登录" }).click(),
  ]);

  // 3. 此时已登录，再去后台页面
  await page.goto("/admin/activities");
  await page.waitForLoadState("networkidle");
});

test("管理员可以创建活动", async ({ page }) => {
    await page.getByRole("button", { name: "新建" }).click();

    await page.getByLabel("标题").fill("羽毛球之夜");
    await page.getByLabel("描述").fill("每周三晚 7-9 点");
    await page.getByLabel("人数上限").fill("12");

    const createPromise = page.waitForResponse(
        (r) => r.url().includes("/admin/activities") && r.status() === 201
    );
    await page.getByRole("button", { name: "保存" }).click();
    await createPromise;

    await expect(page.getByText("羽毛球之夜")).toBeVisible();
});

test("管理员可以编辑活动", async ({ page }) => {
    await page.getByRole("button", { name: "编辑" }).first().click();

    await page.getByLabel("标题").clear();
    await page.getByLabel("标题").fill("羽毛球之夜-改");

    const updatePromise = page.waitForResponse(
        (r) => r.url().includes("/admin/activities") && r.status() === 200
    );
    await page.getByRole("button", { name: "保存" }).click();
    await updatePromise;

    await expect(page.getByText("羽毛球之夜-改")).toBeVisible();
});

test("管理员可以删除活动", async ({ page }) => {
    const deletePromise = page.waitForResponse(
        (r) => r.url().includes("/admin/activities") && r.status() === 204
    );
    await page.getByRole("button", { name: "删除" }).first().click();
    await deletePromise;

    await expect(page.getByText("暂无活动")).toBeVisible();
});
