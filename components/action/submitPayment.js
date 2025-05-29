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
export async function submitPayment(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Kliknutí na tlačítko 'Zaplatit'");
  }
  await waitForCaptchaToFinish();
  const maxTime = 5000; // maximální čekání (ms)
  const interval = 50; // interval mezi pokusy (ms)
  const start = Date.now();
  let clicked = false;
  while (Date.now() - start < maxTime) {
    clicked = await page.evaluate(() => {
      const btn = document.querySelector("#basket-btn-zaplatit");
      if (!btn) return false;
      btn.click();
      return true;
    });

    if (clicked) {
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Kliknutí na tlačítko 'Zaplatit'");
      }
      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Kliknuto na tlačítko 'Zaplatit' v submitPayment.js");
      }
      break;
    }

    await new Promise((res) => setTimeout(res, interval));
  }

  if (!clicked && process.env.CONSOLE_LOGS === "true") {
    console.warn(
      "❌ Tlačítko 'Zaplatit' se neobjevilo nebo se nepodařilo kliknout v submitPayment.js"
    );
  }

  if (process.env.SCREENSHOTS === "true") {
    if (process.env.EXECUTION_TIME === "true") {
      console.time(
        "⏱️ Vytvoření screenshotu 5_Vyplnena stranka na zaplaceni.png v submitPayment.js"
      );
    }
    try {
      await page.screenshot({
        path: "./public/screenshots/5_Vyplnena stranka na zaplaceni.png",
        fullPage: true,
      });
    } catch (err) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.error("❌ Screenshot selhal v submitPayment.js:", err.message);
      }
    }
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd(
        "⏱️ Vytvoření screenshotu 5_Vyplnena stranka na zaplaceni.png v submitPayment.js"
      );
    }
  }

  return clicked;
}
export default submitPayment;
