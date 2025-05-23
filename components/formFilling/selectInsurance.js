import waitForCaptchaToFinish from "../utils/waitForCaptchaToFinish.js";
export async function selectInsurance(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Výběr pojištění execution time");
  }
  await waitForCaptchaToFinish();

  const selector = "#optionsRadiosPoistenie2";
  const maxTime = 1000;
  const interval = 100;
  const start = Date.now();

  let clicked = false;
  let currentFrame = page.mainFrame();

  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      console.log("🔁 Navigace zjištěna, aktualizuji frame");
      currentFrame = frame;
    }
  });

  while (!clicked && Date.now() - start < maxTime) {
    try {
      if (currentFrame.isDetached()) {
        console.warn("⚠️ Frame je odpojený – čekám na nový...");
        await page
          .waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 })
          .catch(() => {});
        currentFrame = page.mainFrame();
        continue;
      }

      const exists = await currentFrame.$(selector);
      if (exists) {
        await currentFrame.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el && !el.checked) el.click();
        }, selector);

        const isChecked = await currentFrame.$eval(
          selector,
          (el) => el.checked
        );
        if (isChecked) {
          clicked = true;
          console.log("✅ Pojištění 'ne' bylo zvoleno");
        } else {
          console.warn("❌ Kliknutí nevedlo ke změně hodnoty");
        }
      }
    } catch (e) {
      console.warn("❌ Chyba při výběru pojištění:", e.message);
    }

    if (!clicked) {
      await new Promise((r) => setTimeout(r, interval));
    }
  }

  if (!clicked) {
    console.warn("❌ Nepodařilo se zvolit pojištění včas");
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Výběr pojištění execution time");
  }
}
