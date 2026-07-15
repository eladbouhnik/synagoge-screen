import { expect, test } from "@playwright/test";

test("home links to board and admin", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "לוח בית כנסת דיגיטלי" })).toBeVisible();
  await expect(page.getByRole("link", { name: /פתיחת לוח תצוגה/ })).toHaveAttribute("href", "/board/demo-board");
  await expect(page.getByRole("link", { name: /כניסה לפאנל/ })).toHaveAttribute("href", "/admin");
});

test("admin dashboard renders demo data", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "בית הכנסת תפארת ירושלים" })).toBeVisible();
  await expect(page.getByText("מסכים פעילים")).toBeVisible();
  await expect(page.getByRole("link", { name: "זמני תפילות" })).toBeVisible();
});

test("board renders fullscreen prayer screen", async ({ page }) => {
  await page.goto("/board/demo-board");

  await expect(page.getByRole("heading", { name: "בית הכנסת תפארת ירושלים" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "זמני תפילות" })).toBeVisible();
  await expect(page.getByText("שחרית", { exact: true })).toBeVisible();
});
