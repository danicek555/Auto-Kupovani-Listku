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
export async function selectTicketType(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Výběr typu lístku");
  }
  await waitForCaptchaToFinish();

  const maxTime = 5000;
  const interval = 10;
  const start = performance.now();

  let labels = [];

  try {
    // Čekej než se elementy objeví
    await page
      .waitForSelector('label[for="pickupTypeOption"]', { timeout: 5000 })
      .catch((err) =>
        console.error(
          "❌ Element 'label[for='pickupTypeOption']' v selectTicketType.js nebyl nalezen",
          err.message
        )
      );

    while (performance.now() - start < maxTime) {
      labels = await page
        .$$('label[for="pickupTypeOption"]')
        .catch((err) =>
          console.error(
            "❌ Element 'label[for='pickupTypeOption']' v selectTicketType.js nebyl nalezen",
            err.message
          )
        );

      if (labels.length >= 2) {
        await labels[0].click(); // eTicket
        if (process.env.CONSOLE_LOGS === "true") {
          console.log("✅ Kliknuto na eTicket v selectTicketType.js");
        }

        if (process.env.EXECUTION_TIME === "true") {
          console.timeEnd("⏱️ Výběr typu lístku");
        }
        return;
      }

      await new Promise((r) => setTimeout(r, interval));
    }
  } catch (error) {
    console.warn(
      "❌ Chyba při výběru typu lístku v selectTicketType.js:",
      error.message
    );
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Výběr typu lístku");
  }
}
export default selectTicketType;
