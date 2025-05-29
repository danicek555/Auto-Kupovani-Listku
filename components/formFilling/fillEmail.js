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
export async function fillEmail(page) {
  if (process.env.EXECUTION_TIME === "true")
    console.time("⏱️ Vyplňování emailu");
  const email = process.env.CONTACT_EMAIL || "danmitka@gmail.com";
  await waitForCaptchaToFinish();

  try {
    await page
      .waitForSelector("#email_pickup_7", {
        visible: true,
        timeout: 5000,
      })
      .catch((err) =>
        console.error(
          "❌ Element 'email_pickup_7' v fillEmail.js nebyl nalezen:",
          err.message
        )
      );

    await page.$eval(
      "#email_pickup_7",
      (input, email) => {
        input.value = email;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      },
      email
    );

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(`✅ Vyplněn e-mail: ${email} v fillEmail.js`);
    }
  } catch (error) {
    console.warn(
      "❌ E-mail se nepodařilo vyplnit v fillEmail.js:",
      error.message
    );
  }

  if (process.env.EXECUTION_TIME === "true")
    console.timeEnd("⏱️ Vyplňování emailu");
}
export default fillEmail;
