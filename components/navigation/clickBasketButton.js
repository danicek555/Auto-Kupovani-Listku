export async function clickBasketButton(page) {
  if (process.env.CONSOLE_LOGS === "true") {
    console.log(
      "🔁 Začínám rychlý polling tlačítka 'Pokračovat do košíku'... v clickBasketButton.js"
    );
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }

  const maxTime = 2000;
  const interval = 10;
  const start = performance.now();
  const maxAttempts = 3;
  let attempts = 0;

  while (performance.now() - start < maxTime && attempts < maxAttempts) {
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector("#hladisko-basket-btn");
      if (!btn) {
        console.error(
          "❌ Element 'hladisko-basket-btn' v clickBasketButton.js nebyl nalezen"
        );
        return false;
      }
      btn.click();
      return true;
    });

    if (clicked) {
      attempts++;
      if (process.env.CONSOLE_LOGS === "true") {
        console.log(
          `✅ Pokus #${attempts}: Kliknutí provedeno, čekám na /Basket...`
        );
      }

      try {
        await page.waitForFunction(
          () => location.pathname.includes("/Basket"),
          { timeout: 5000 }
        );

        if (process.env.CONSOLE_LOGS === "true") {
          console.log("✅ Detekováno přesměrování na /Basket.");
        }

        if (process.env.EXECUTION_TIME === "true") {
          console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
        }

        return performance.now() - start;
      } catch (e) {
        if (process.env.CONSOLE_LOGS === "true") {
          console.warn("⚠️ URL se nezměnila, zkouším znovu...");
        }
      }
    }

    await page.waitForTimeout(interval);
  }

  console.warn(
    `❌ Nepodařilo se kliknout na tlačítko nebo přesměrovat na /Basket po ${attempts} pokusech / ${maxTime} ms.`
  );

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }

  return null;
}
