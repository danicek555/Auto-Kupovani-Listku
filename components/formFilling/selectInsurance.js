export async function selectInsurance(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Výběr pojištění v selectInsurance.js");
  }

  const selector = "#optionsRadiosPoistenie2";
  const maxTime = 5000;
  const interval = 10;
  const start = Date.now();

  let before;
  let clicked = false;

  while (!clicked && Date.now() - start < maxTime) {
    try {
      const exists = await page.$(selector).catch((err) => {
        console.warn(
          "❌ Pojištění 'ne' se neobjevilo v selectInsurance.js: " + err.message
        );
      });
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
            console.log("✅ Pojištění 'ne' bylo zvoleno v selectInsurance.js");
          }
        } else {
          console.warn(
            "❌ Kliknutí na pojištění nevedlo ke změně hodnoty v selectInsurance.js"
          );
        }
      }
    } catch (e) {
      if (e.message.includes("Execution context was destroyed")) {
        console.warn(
          "❌ Stránka byla přesměrována během výběru pojištění v selectInsurance.js. Zkouším znovu..."
        );
      } else {
        console.warn(
          "❌ Jiná chyba při výběru pojištění v selectInsurance.js:",
          e.message
        );
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

  if (process.env.CONSOLE_LOGS === "true") {
    try {
      const after = await page.$eval(selector, (el) => el.checked);
      console.log(
        `✅ Stav checkboxu pojištění před: ${before}, po: ${after} v selectInsurance.js`
      );
    } catch (error) {
      console.warn(
        "❌ Nelze ověřit finální stav pojištění - element nebyl nalezen v selectInsurance.js"
      );
    }
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Výběr pojištění");
  }
}
