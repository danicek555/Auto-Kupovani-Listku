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

export async function clickBasketButton(page) {
  if (process.env.CONSOLE_LOGS === "true") {
    console.log("🔁 Začínám polling tlačítka 'Pokračovat do košíku'...");
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }

  const interval = 100; // mírně prodloužím pro stabilitu
  const maxAttempts = 20;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const button = await page.$("#hladisko-basket-btn");
    if (!button) {
      console.error("❌ Element 'hladisko-basket-btn' nebyl nalezen");
      await sleep(interval);
      continue;
    }

    // Pro jistotu použij .evaluate(), aby spustil i JS funkce z href
    await page.evaluate((btn) => btn.click(), button);

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(
        `✅ Pokus #${attempt}: Kliknutí provedeno, čekám na /Basket...`
      );
    }

    try {
      await page.waitForFunction(
        () => window.location.pathname.includes("/Basket"),
        {
          timeout: 3000,
        }
      );

      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Přesměrování na /Basket detekováno.");
      }

      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
      }

      return attempt;
    } catch {
      if (process.env.CONSOLE_LOGS === "true") {
        console.warn("⚠️ Přesměrování nenastalo, zkouším znovu...");
      }
    }

    await sleep(interval);
  }

  console.warn(
    `❌ Nepodařilo se kliknout na tlačítko nebo přesměrovat na /Basket po ${maxAttempts} pokusech.`
  );

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }

  return null;
}

export default clickBasketButton;
