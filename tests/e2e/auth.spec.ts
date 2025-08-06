import { test, expect } from "@playwright/test";

test("用户可注册并登录", async ({ page }) => {
  const unique = Date.now().toString();
  const email = `user${unique}@test.com`;
  const name = `user${unique}`;
  const pwd = "123456";

  // 1. 打开首页
  await page.goto("/");
  await expect(page).toHaveTitle(/Sports Room/);

  // 2. 点击注册
  await page.getByRole("link", { name: "注册" }).click();

  // 3. 拦截注册接口，等待它完成
  const registerPromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/auth/register") && res.status() === 201,
    { timeout: 10000 }
  );

  // 4. 填写表单并提交
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("昵称").fill(name);
  await page.getByLabel("密码", { exact: true }).fill(pwd);
  await page.getByLabel("确认密码").fill(pwd);
  await page.getByRole("button", { name: "注册" }).click();

  // 5. 等待注册成功响应
  await registerPromise;

  // 6. 等待跳转到登录页
  await page.waitForURL("/login");

  // 7. 登录
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(pwd);
  await page.getByRole("button", { name: "登录" }).click();

  const loginPromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/auth/login") && res.status() === 200,
    { timeout: 10000 }
  );

  await loginPromise;
});