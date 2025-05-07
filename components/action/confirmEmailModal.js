export async function confirmEmailModal(page) {
  try {
    await page.waitForFunction(() =>
      window.location.href.includes("Basket#modalEmailOK")
    );
    console.log("Stránka s potvrzením emailu načtena.");

    await page
      .waitForSelector("#quick-buy-btn-confirm-confirm", {
        visible: true,
        timeout: 10000,
      })
      .catch(() =>
        console.error(
          "❌ Objevila se chyba při načítání confirmEmailModal tlačítka"
        )
      );

    await page.click("#quick-buy-btn-confirm-confirm");
    console.log("Kliknuto na 'Ano, potvrdit'.");

    if (process.env.SCREENSHOTS === "true") {
      await page.screenshot({
        path: "./public/screenshots/6_Stranka na zaplaceni.png",
        fullPage: true,
      });
    }
  } catch (err) {
    console.error("❌ Chyba při čekání na potvrzení emailu:", err.message);
    throw err; // Re-throw the error to handle it in the calling function
  }
}
