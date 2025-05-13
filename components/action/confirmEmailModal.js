export async function confirmEmailModal(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Klikání na tlačítko 'Ano, potvrdit'");
  }

  try {
    // Čekání na URL s #modalEmailOK
    const maxTime = 5000;
    const interval = 50;
    const start = Date.now();

    let urlReady = false;

    while (Date.now() - start < maxTime) {
      const currentUrl = page.url();
      if (currentUrl.includes("Basket#modalEmailOK")) {
        urlReady = true;
        break;
      }
      await new Promise((res) => setTimeout(res, interval));
    }

    if (!urlReady) {
      throw new Error(
        "URL s 'Basket#modalEmailOK' se neobjevila včas v confirmEmailModal.js"
      );
    }

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(
        "✅ Stránka s potvrzením emailu načtena v confirmEmailModal.js"
      );
    }

    // Pooling na tlačítko
    let clicked = false;
    const buttonStart = Date.now();

    while (Date.now() - buttonStart < maxTime) {
      clicked = await page.evaluate(() => {
        const btn = document.querySelector("#quick-buy-btn-confirm-confirm");
        if (!btn) return false;
        btn.click();
        return true;
      });

      if (clicked) break;
      await new Promise((res) => setTimeout(res, interval));
    }

    if (clicked) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Kliknuto na 'Ano, potvrdit' v confirmEmailModal.js");
      }
    } else {
      throw new Error(
        "Tlačítko 'Ano, potvrdit' nebylo nalezeno nebo se nepodařilo kliknout v confirmEmailModal.js"
      );
    }

    // Screenshot (volitelný)
    if (process.env.SCREENSHOTS === "true") {
      if (process.env.EXECUTION_TIME === "true") {
        console.time(
          "⏱️ Vytvoření screenshotu 6_Stranka s potvrzenim emailu.png v confirmEmailModal.js"
        );
      }
      try {
        await page.screenshot({
          path: "./public/screenshots/6_Stranka s potvrzenim emailu.png",
          fullPage: true,
        });
      } catch (err) {
        if (process.env.CONSOLE_LOGS === "true") {
          console.error(
            "❌ Screenshot selhal v confirmEmailModal.js:",
            err.message
          );
        }
      }
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd(
          "⏱️ Vytvoření screenshotu 6_Stranka s potvrzenim emailu.png v confirmEmailModal.js"
        );
      }
    }

    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Klikání na tlačítko 'Ano, potvrdit'");
    }

    return true;
  } catch (err) {
    console.error("❌ Chyba v confirmEmailModal.js:", err.message);
    return false;
  }
}
