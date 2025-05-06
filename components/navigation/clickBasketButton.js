export async function clickBasketButton(page) {
  if (process.env.CONSOLE_LOGS === "true") {
    console.log("🔁 Začínám rychlý polling tlačítka 'Pokračovat do košíku'...");
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
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Kliknutí na 'Pokračovat do košíku' proběhlo.");
      }
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
      }
      return performance.now() - start;
    }

    await page.waitForTimeout(interval);
  }

  console.warn(`❌ Tlačítko se neobjevilo do ${maxTime} ms.`);

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }
  return null;
}
