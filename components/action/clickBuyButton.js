// Copyright 2025 Daniel Mitka
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { sleep } from "../utils/sleep.js";

export async function clickBuyButton(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Kliknutí na tlačítko 'Koupit'");
  }

  const maxTime = 10 * 60 * 1000;
  const interval = 150 + Math.floor(Math.random() * 100); // 150–250ms
  const start = Date.now();
  let attempt = 0;

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

      const result = await page.evaluate(() => {
        const buyBtn = document.querySelector("a.btn.btn-buy.flex-c");
        const infoBtn = document.querySelector("button.btn-default.centerer");

        if (buyBtn) {
          const isDisabled = buyBtn
            .closest(".ticket-cover")
            ?.classList.contains("disabled");
          return { found: true, disabled: isDisabled, type: "buy" };
        } else if (infoBtn) {
          const text = infoBtn.getAttribute("data-content") || "";
          return {
            found: false,
            disabled: true,
            type: "info",
            statusText: text,
          };
        }

        return { found: false, disabled: null, type: "none" };
      });

      console.log("📋 Výsledek kontroly tlačítka:", result);

      if (result.type === "buy") {
        if (result.disabled) {
          console.log(
            "🔁 Tlačítko `Koupit` je neaktivní. Čekám a zkouším znovu..."
          );
          await sleep(interval);
          continue;
        } else {
          console.log("✅ Tlačítko `Koupit` nalezeno a aktivní. Klikám...");

          await page.evaluate(() => {
            const btn = document.querySelector("a.btn.btn-buy.flex-c");
            btn?.click();
          });

          console.log("✅ Kliknutí proběhlo");
          if (process.env.EXECUTION_TIME === "true") {
            console.timeEnd("⏱️ Kliknutí na tlačítko 'Koupit'");
          }

          return true;
        }
      } else if (result.type === "info") {
        console.log(`🕒 Prodej ještě nezačal – stav: ${result.statusText}`);
        await sleep(interval);
        continue;
      } else {
        console.log("❌ Žádné relevantní tlačítko zatím není na stránce.");
        await sleep(interval);
        continue;
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

  console.warn("❌ Tlačítko `Koupit` nebylo aktivní během limitu.");
  return false;
}
export default clickBuyButton;
