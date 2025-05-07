export async function submitPayment(page) {
  await page
    .waitForSelector("#basket-btn-zaplatit", {
      visible: true,
      timeout: 3000,
    })
    .catch((err) =>
      console.error("❌ Tlačítko 'Zaplatit' nebylo nalezeno", err)
    );

  await page
    .$eval("#basket-btn-zaplatit", (btn) => {
      btn.click();
      return true;
    })
    .catch((err) =>
      console.error("❌ Kliknutí na tlačítko 'Zaplatit' selhalo", err)
    );

  if (process.env.CONSOLE_LOGS === "true") {
    console.log("✅ Kliknuto na tlačítko 'Zaplatit'.");
  }

  if (process.env.SCREENSHOTS === "true") {
    await page
      .screenshot({
        path: "./public/screenshots/5_Vyplnena stranka na zaplaceni.png",
        fullPage: true,
      })
      .catch((err) => {
        if (process.env.CONSOLE_LOGS === "true") {
          console.error(
            "❌ Screenshot 5_Vyplnena stranka na zaplaceni.png selhal",
            err
          );
        }
      });
  }
}
