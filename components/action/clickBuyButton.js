export async function clickBuyButton(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Kliknutí na tlačítko 'Koupit'");
  }

  const maxTime = 2000; // max čekání (ms)
  const interval = 10; // interval mezi pokusy (ms)
  const start = Date.now();

  let clicked = false;

  while (Date.now() - start < maxTime) {
    clicked = await page.evaluate(() => {
      const btn = document.querySelector("a.btn.btn-buy.flex-c");
      if (!btn) {
        console.error(
          "❌ Element 'a.btn.btn-buy.flex-c' v clickBuyButton.js nebyl nalezen"
        );
        return false;
      }
      if (btn) {
        btn.click();
        return true;
      }
    });

    if (clicked) {
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Kliknutí na tlačítko 'Koupit'");
      }
      return true;
    }

    await new Promise((r) => setTimeout(r, interval));
  }

  if (process.env.CONSOLE_LOGS === "true") {
    console.warn(`❌ Tlačítko Buy Button se neobjevilo.`);
  }
  return false;
}
