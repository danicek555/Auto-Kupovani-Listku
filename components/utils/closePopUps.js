export async function closePopups(page) {
  const closePopup = await page.$(".popup-close-btn");
  if (closePopup) {
    await closePopup.click();
    console.log("Zavírám pop-up.");
    await page.waitForTimeout(1000);
  }
}
