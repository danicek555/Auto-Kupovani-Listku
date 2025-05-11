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

    if (!result.found) {
      console.log("❌ Tlačítko `Koupit` nebylo nalezeno v clickeBuyButton.js");
    } else if (result.disabled) {
      console.log(
        "🔁 Tlačítko `Koupit` je neaktivní v clickeBuyButton.js. Zkouším znovu..."
      );
    } else {
      // Klikni, ale kliknutí udělej v evaluate, jinak Puppeteer vyhodí chybu
      await page.evaluate(() => {
        const btn = document.querySelector("a.btn.btn-buy.flex-c");
        btn?.click();
      });
      if (process.env.CONSOLE_LOGS === "true") {
        console.log(
          "✅ Kliknutí na tlačítko koupit se povedlo v clickeBuyButton.js"
        );
      }
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
