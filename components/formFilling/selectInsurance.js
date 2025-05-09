export async function selectInsurance(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Výběr pojištění");
  }

  const selector = "#optionsRadiosPoistenie2";
  const maxTime = 5000;
  const interval = 10;
  const start = Date.now();

  let before;
  let clicked = false;

  while (!clicked && Date.now() - start < maxTime) {
    try {
      const exists = await page.$(selector);
      if (exists) {
        before = await page.$eval(selector, (el) => el.checked);
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) el.click();
        }, selector);

        const isChecked = await page.$eval(selector, (el) => el.checked);
        if (isChecked) {
          clicked = true;
          if (process.env.CONSOLE_LOGS === "true") {
            console.log("✅ Pojištění 'ne' bylo zvoleno.");
          }
        } else {
          console.warn("❌ Kliknutí na pojištění nevedlo ke změně hodnoty.");
        }
      }
    } catch (e) {
      if (e.message.includes("Execution context was destroyed")) {
        console.warn(
          "❌ Stránka byla přesměrována během výběru pojištění. Zkouším znovu..."
        );
      } else {
        console.warn("❌ Jiná chyba při výběru pojištění:", e.message);
      }
    }

    if (!clicked) {
      await new Promise((r) => setTimeout(r, interval));
    }
  }

  if (!clicked) {
    console.warn(
      "❌ Pojištění 'ne' se neobjevilo nebo se nepodařilo zakliknout v selectInsurance.js"
    );
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Výběr pojištění");
  }

  const after = await page.$eval(selector, (el) => el.checked);
  console.log(`✅ Stav checkboxu před: ${before}, po: ${after}`);
}
