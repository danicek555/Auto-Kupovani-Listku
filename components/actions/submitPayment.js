export async function submitPayment(page) {
  await page.screenshot({
    path: "./screenshots/7_Vyplnena stranka na zaplaceni.png",
    fullPage: true,
  });

  await page.waitForSelector("#basket-btn-zaplatit", { visible: true });
  await page.click("#basket-btn-zaplatit");
  console.log("Kliknuto na tlačítko 'Zaplatit'.");
}
