// import { sleep } from "../utils/sleep.js";

// export async function clickBuyButton(page) {
//   if (process.env.EXECUTION_TIME === "true") {
//     console.time("⏱️ Kliknutí na tlačítko 'Koupit'");
//   }

//   const maxTime = 2 * 60 * 1000; // 2 minuty
//   const interval = 50;
//   const start = Date.now();

//   let clicked = false;
//   await sleep(1000);
//   while (Date.now() - start < maxTime) {
//     const result = await page.evaluate(() => {
//       const btn = document.querySelector("a.btn.btn-buy.flex-c");

//       if (!btn) {
//         return { found: false, disabled: null };
//       }

//       const isDisabled = btn
//         .closest(".ticket-cover")
//         ?.classList.contains("disabled");

//       return { found: true, disabled: isDisabled };
//     });
//     const isWebDriver = await page.evaluate(() => navigator.webdriver);
//     console.log("🧪 navigator.webdriver =", isWebDriver);

//     console.log("jsem tu");

//     if (!result.found) {
//       console.log("❌ Tlačítko `Koupit` nebylo nalezeno v clickeBuyButton.js");
//     } else if (result.disabled) {
//       console.log(
//         "🔁 Tlačítko `Koupit` je neaktivní v clickBuyButton.js. Zkouším znovu..."
//       );
//     } else {
//       // Klikni, ale kliknutí udělej v evaluate, jinak Puppeteer vyhodí chybu
//       console.log("kliknu");
//       await page.evaluate(() => {
//         const btn = document.querySelector("a.btn.btn-buy.flex-c");
//         btn?.click();
//       });
//       if (process.env.CONSOLE_LOGS === "true") {
//         console.log(
//           "✅ Kliknutí na tlačítko koupit se povedlo v clickBuyButton.js"
//         );
//       }
//       console.log("klikl");
//       if (process.env.EXECUTION_TIME === "true") {
//         console.timeEnd("⏱️ Kliknutí na tlačítko 'Koupit'");
//       }
//       return true;
//     }

//     await new Promise((r) => setTimeout(r, interval));
//   }

//   console.warn(
//     "❌ Tlačítko `Koupit` nebylo aktivní během 2 minut v clickeBuyButton.js"
//   );
//   return false;
// }
// import { sleep } from "../utils/sleep.js";

// export async function clickBuyButton(page) {
//   if (process.env.EXECUTION_TIME === "true") {
//     console.time("⏱️ Kliknutí na tlačítko 'Koupit'");
//   }

//   const maxTime = 2 * 60 * 1000; // 2 minuty
//   const interval = 1000;
//   const start = Date.now();
//   await sleep(2000);
//   console.log("cekal jsem 2 s");
//   let attempt = 0;

//   while (Date.now() - start < maxTime) {
//     attempt++;

//     if (page.isClosed()) {
//       console.error("❌ Stránka byla zavřena – přerušeno.");
//       return false;
//     }

//     try {
//       const url = page.url();
//       console.log(`🔍 Pokus ${attempt} | URL: ${url}`);

//       const result = await page.evaluate(() => {
//         const btn = document.querySelector("a.btn.btn-buy.flex-c");
//         if (!btn) return { found: false, disabled: null };

//         const isDisabled = btn
//           .closest(".ticket-cover")
//           ?.classList.contains("disabled");
//         return { found: true, disabled: isDisabled };
//       });

//       // const isWebDriver = await page.evaluate(() => navigator.webdriver);
//       // console.log("🧪 navigator.webdriver =", isWebDriver);

//       if (!result.found) {
//         console.log("❌ Tlačítko `Koupit` nebylo nalezeno");
//       } else if (result.disabled) {
//         console.log("🔁 Tlačítko `Koupit` je neaktivní. Zkouším znovu...");
//       } else {
//         console.log("🟢 Tlačítko nalezeno a aktivní. Klikám...");

//         await page.evaluate(() => {
//           const btn = document.querySelector("a.btn.btn-buy.flex-c");
//           btn?.click();
//         });

//         await sleep(1000); // Dej čas na redirect/reakci stránky

//         if (process.env.CONSOLE_LOGS === "true") {
//           console.log("✅ Kliknutí proběhlo");
//         }
//         if (process.env.EXECUTION_TIME === "true") {
//           console.timeEnd("⏱️ Kliknutí na tlačítko 'Koupit'");
//         }
//         return true;
//       }
//     } catch (err) {
//       console.error("💥 Chyba při hledání/kliknutí na tlačítko:", err.message);
//       return false;
//     }

//     await sleep(interval);
//   }

//   console.warn("❌ Tlačítko `Koupit` nebylo aktivní během 2 minut.");
//   return false;
// }
import { sleep } from "../utils/sleep.js";

export async function clickBuyButton(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Kliknutí na tlačítko 'Koupit'");
  }

  const maxTime = 2 * 60 * 1000;
  const interval = 1000;
  const start = Date.now();
  let attempt = 0;

  console.log("⏳ Čekám 2 sekundy na načtení stránky...");
  await sleep(2000);
  console.log("✅ Počáteční čekání dokončeno");

  while (Date.now() - start < maxTime) {
    attempt++;
    console.log(
      `🌀 Pokus ${attempt} | Čas od startu: ${Date.now() - start} ms`
    );

    if (page.isClosed()) {
      console.error("❌ Stránka byla zavřená – přerušeno.");
      return false;
    }

    try {
      const url = page.url();
      console.log(`🌐 Aktuální URL: ${url}`);

      const found = await page.$("a.btn.btn-buy.flex-c");

      if (!found) {
        console.log("❌ Tlačítko `Koupit` nebylo nalezeno. Zkouším znovu...");
        await sleep(interval);
        continue;
      }

      const result = await page.evaluate(() => {
        const btn = document.querySelector("a.btn.btn-buy.flex-c");
        if (!btn) return { found: false, disabled: null };

        const isDisabled = btn
          .closest(".ticket-cover")
          ?.classList.contains("disabled");

        return { found: true, disabled: isDisabled };
      });

      console.log("📋 Výsledek kontroly tlačítka:", result);

      if (result.disabled) {
        console.log(
          "🔁 Tlačítko `Koupit` je neaktivní. Čekám a zkouším znovu..."
        );
      } else {
        console.log("🟢 Tlačítko nalezeno a aktivní. Klikám...");

        await page.evaluate(() => {
          const btn = document.querySelector("a.btn.btn-buy.flex-c");
          btn?.click();
        });

        console.log("⏳ Čekám 3 sekundy na redirect...");
        await sleep(3000);

        console.log("✅ Kliknutí proběhlo");
        if (process.env.EXECUTION_TIME === "true") {
          console.timeEnd("⏱️ Kliknutí na tlačítko 'Koupit'");
        }

        return true;
      }
    } catch (err) {
      const msg = err?.message || String(err);
      console.error("💥 CHYBA při hledání/kliknutí na tlačítko:", msg);

      if (msg.includes("detached") || msg.includes("Target closed")) {
        console.warn(
          "⚠️ Frame nebo target byl odpojen — Vracím false a přenechávám hlavní logice restart"
        );
        return false;
      } else {
        console.warn("⚠️ Neznámá chyba. Počkám a zkusím znovu.");
      }
    }

    console.log(`🕐 Čekám ${interval}ms před dalším pokusem...`);
    await sleep(interval);
  }

  console.warn("❌ Tlačítko `Koupit` nebylo aktivní během 2 minut.");
  return false;
}
