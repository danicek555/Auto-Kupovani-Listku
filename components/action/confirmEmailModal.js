export async function confirmEmailModal(page) {
  await page.waitForFunction(() =>
    window.location.href.includes("Basket#modalEmailOK")
  );
  console.log("Stránka s potvrzením emailu načtena.");

  await page.waitForSelector("#quick-buy-btn-confirm-confirm", {
    visible: true,
  });
  await page.click("#quick-buy-btn-confirm-confirm");
  console.log("Kliknuto na 'Ano, potvrdit'.");
}
