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
export async function choosePayment(page) {
  const selector = "#template_payOption_17";
  const timeout = 5000;
  const pollInterval = 50;
  await waitForCaptchaToFinish();

  const waitForAndClick = async () => {
    while (true) {
      try {
        const element = await page.$(selector);
        if (element) {
          await page.click(selector);
          if (process.env.CONSOLE_LOGS === "true") {
            console.log(
              "✅ Zvolena platba kartou / Google Pay / Apple Pay v choosePayment.js"
            );
          }
          return true;
        }
      } catch (e) {
        const msg = e.message;
        if (msg.includes("Execution context was destroyed")) {
          console.warn(
            "❌ Přesměrování při výběru platby v choosePayment.js. Zkouším znovu..."
          );
        } else {
          console.warn("❌ Chyba při výběru platby v choosePayment.js:", msg);
        }
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }
  };

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), timeout)
  );

  try {
    if (process.env.EXECUTION_TIME === "true") {
      console.time("⏱️ Doba pollingu 'Zvolit platbu'");
    }
    await Promise.race([waitForAndClick(), timeoutPromise]);
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Doba pollingu 'Zvolit platbu'");
    }
  } catch (error) {
    console.warn(
      "❌ Nepodařilo se zvolit platbu v choosePayment.js:",
      error.message
    );
  }
}
export default choosePayment;
