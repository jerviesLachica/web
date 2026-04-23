import { expect, test } from "@playwright/test"

test("setup page is reachable when Firebase is not configured", async ({
  page,
}) => {
  await page.goto("/setup")
  await expect(page.getByText("Firebase Setup Required")).toBeVisible()
})
