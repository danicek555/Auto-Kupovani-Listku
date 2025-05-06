export async function submitPayment(page) {
  try {
    await page.waitForSelector("#basket-btn-zaplatit", {
      visible: true,
      timeout: 3000,
    });

    const clicked = await page.$eval("#basket-btn-zaplatit", (btn) => {
      btn.click();
      return true;
    });

    console.log("✅ Kliknuto na tlačítko 'Zaplatit'.");
  } catch (error) {
    console.warn(
      "❌ Tlačítko 'Zaplatit' nebylo nalezeno nebo kliknutí selhalo:",
      error.message
    );
    return;
  }

  await page.screenshot({
    path: "./public/screenshots/7_Vyplnena stranka na zaplaceni.png",
    fullPage: true,
  });
}
