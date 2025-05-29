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

export async function acceptTerms(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Zaškrtnutí checkboxů");
  }

  await waitForCaptchaToFinish();

  try {
    const { totalCheckboxes, clickedCount } = await page.$$eval(
      '.terms-accept input[type="checkbox"]',
      (checkboxes) => {
        let count = 0;
        for (const cb of checkboxes) {
          if (!cb.checked) {
            cb.click();
            count++;
          }
        }
        return { totalCheckboxes: checkboxes.length, clickedCount: count };
      }
    );

    if (process.env.CONSOLE_LOGS === "true") {
      if (clickedCount > 0) {
        console.log(`✅ Zaškrtnuto ${clickedCount} checkboxů v acceptTerms.js`);
      } else if (totalCheckboxes > 0 && clickedCount === 0) {
        console.log(
          `✅ Všechny checkboxy (${totalCheckboxes}) už byly zaskrtnuté v acceptTerms.js`
        );
      } else {
        console.log("❌ Nebyly nalezeny žádné checkboxy v acceptTerms.js");
      }
    }
  } catch (error) {
    console.warn(
      "❌ Nepodařilo se zaškrtnout checkboxy v acceptTerms.js:",
      error.message
    );
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Zaškrtnutí checkboxů");
  }
}

export default acceptTerms;
