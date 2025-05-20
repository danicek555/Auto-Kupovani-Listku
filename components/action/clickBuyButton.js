export async function clickBuyButton(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Kliknutí na tlačítko 'Koupit'");
  }

  const maxTime = 2 * 60 * 1000; // 2 minuty
  const interval = 50;
  const start = Date.now();

  let clicked = false;

  while (Date.now() - start < maxTime) {
    const result = await page.evaluate(() => {
      const btn = document.querySelector("a.btn.btn-buy.flex-c");

      if (!btn) {
        return { found: false, disabled: null };
      }

      const isDisabled = btn
        .closest(".ticket-cover")
        ?.classList.contains("disabled");

      return { found: true, disabled: isDisabled };
    });
    const isWebDriver = await page.evaluate(() => navigator.webdriver);
    console.log("🧪 navigator.webdriver =", isWebDriver);

    console.log("jsem tu");
    if (!result.found) {
      console.log("❌ Tlačítko `Koupit` nebylo nalezeno v clickeBuyButton.js");
    } else if (result.disabled) {
      console.log(
        "🔁 Tlačítko `Koupit` je neaktivní v clickBuyButton.js. Zkouším znovu..."
      );
    } else {
      // Klikni, ale kliknutí udělej v evaluate, jinak Puppeteer vyhodí chybu
      console.log("kliknu");
      await page.evaluate(() => {
        const btn = document.querySelector("a.btn.btn-buy.flex-c");
        btn?.click();
      });
      if (process.env.CONSOLE_LOGS === "true") {
        console.log(
          "✅ Kliknutí na tlačítko koupit se povedlo v clickBuyButton.js"
        );
      }
      console.log("klikl");
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Kliknutí na tlačítko 'Koupit'");
      }
      return true;
    }

    await new Promise((r) => setTimeout(r, interval));
  }

  console.warn(
    "❌ Tlačítko `Koupit` nebylo aktivní během 2 minut v clickeBuyButton.js"
  );
  return false;
}
