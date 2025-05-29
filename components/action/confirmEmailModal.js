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
import waitForCaptchaToFinish from "../captcha/waitForCaptchaToFinish.js";

export async function confirmEmailModal(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Potvrzení emailu");
  }

  await waitForCaptchaToFinish();

  try {
    const STYLY = process.env.STYLY === "false" ? false : true;
    const maxTime = 10000;
    const interval = 50;

    if (STYLY) {
      console.log("🔁 Čekám na zobrazení modalu s emailem (se styly)...");
      await page.waitForSelector("#modalEmailOK.in", { timeout: maxTime });

      console.log("🔁 Čekám na tlačítko 'Ano, potvrdit' (se styly)...");
      await page.waitForSelector("#quick-buy-btn-confirm-confirm", {
        visible: true,
        timeout: maxTime,
      });

      await page.click("#quick-buy-btn-confirm-confirm");

      console.log("✅ Kliknuto na 'Ano, potvrdit' (se styly)");
    } else {
      console.log("🔁 Polling na tlačítko 'Ano, potvrdit' (bez stylů)...");
      let clicked = false;
      const buttonStart = Date.now();

      while (Date.now() - buttonStart < maxTime) {
        if (page.isClosed()) {
          throw new Error("Stránka byla zavřena během pollingu tlačítka.");
        }

        console.log("Pooling...");

        try {
          clicked = await page.evaluate(() => {
            const btn = document.querySelector(
              "#quick-buy-btn-confirm-confirm"
            );
            if (!btn) return false;
            btn.click();
            return true;
          });

          if (clicked) {
            console.log("✅ Kliknuto na 'Ano, potvrdit' (bez stylů)");
            break;
          }
        } catch (err) {
          if (err.message.includes("Execution context was destroyed")) {
            console.warn(
              "⚠️ Kontext zničen (pravděpodobně navigace) - považuji kliknutí za úspěšné."
            );
            clicked = true;
            break;
          } else {
            console.error("❌ Neočekávaná chyba při evaluate:", err.message);
          }
        }

        await new Promise((res) => setTimeout(res, interval));
      }

      if (!clicked) {
        throw new Error(
          "Tlačítko 'Ano, potvrdit' nebylo nalezeno nebo kliknutí selhalo."
        );
      }
    }

    if (process.env.SCREENSHOTS === "true") {
      if (process.env.EXECUTION_TIME === "true") {
        console.time("⏱️ Screenshot modalu");
      }
      await page.screenshot({
        path: "./public/screenshots/6_Stranka s potvrzenim emailu.png",
        fullPage: true,
      });
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Screenshot modalu");
      }
    }

    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Potvrzení emailu");
    }

    return true;
  } catch (err) {
    console.error("❌ Chyba v confirmEmailModal.js:", err.message);
    return false;
  }
}

export default confirmEmailModal;
