export async function clickBasketButton(page) {
  if (process.env.CONSOLE_LOGS === "true") {
    console.log(
      "🔁 Začínám rychlý polling tlačítka 'Pokračovat do košíku'... v clickBasketButton.js"
    );
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }

  const maxTime = 2000; // maximální doba čekání (ms)
  const interval = 10; // interval mezi pokusy (ms)

  let clicked = false;
  const start = performance.now();

  while (performance.now() - start < maxTime) {
    clicked = await page.evaluate(() => {
      const btn = document.querySelector("#hladisko-basket-btn");
      if (!btn) {
        console.error(
          "❌ Element 'hladisko-basket-btn' v clickBasketButton.js nebyl nalezen"
        );
        return false;
      }
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.log(
          "✅ Kliknutí na 'Pokračovat do košíku' proběhlo v clickBasketButton.js"
        );
      }
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
      }
      return performance.now() - start;
    }

    await page.waitForTimeout(interval);
  }

  console.warn(
    `❌ Tlačítko 'Pokračovat do košíku' se neobjevilo do ${maxTime} ms. v clickBasketButton.js`
  );

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }
  return null;
}
