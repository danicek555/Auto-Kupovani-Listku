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
import fs from "fs/promises";

export async function getM(page) {
  if (process.env.EXECUTION_TIME === "true")
    console.time("⏱️ m execution time");

  const maxAttempts = 100;
  const waitBetween = 5000;
  let data = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (page.isClosed()) {
      console.warn(
        "❌ Stránka byla zavřená (frame detached), přeskakuju getM()"
      );
      return;
    }

    try {
      if (process.env.EXECUTION_TIME === "true") console.time("⏱️ cekam na m");
      await page.waitForFunction('typeof m !== "undefined"', { timeout: 3000 });
      if (process.env.EXECUTION_TIME === "true")
        console.timeEnd("⏱️ cekam na m");
    } catch (waitErr) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.warn(`⏳ Pokus ${attempt}: m ještě není dostupné`);
      }
      await new Promise((res) => setTimeout(res, waitBetween));
      continue;
    }

    try {
      if (process.env.EXECUTION_TIME === "true") console.time("⏱️ evaluate m");

      data = await page.evaluate(() => {
        const obj = {};
        Object.keys(window.m).forEach((key) => {
          obj[key] = window.m[key];
        });
        return obj;
      });

      if (process.env.EXECUTION_TIME === "true")
        console.timeEnd("⏱️ evaluate m");

      if (process.env.SECURE_DATA === "true") {
        console.log("Zapl jsem secure");
        const keys = Object.keys(data);
        const hasValidKeys = keys.some(
          (k) => k.startsWith("-") || parseInt(k) < 0
        );
        if (hasValidKeys) {
          await fs.writeFile("public/data/m_data.json", JSON.stringify(data));
          if (process.env.CONSOLE_LOGS === "true") {
            console.log(
              `✅ Data uložena (pokus ${attempt}) do m_data.json v getM.js`
            );
          }
          if (process.env.EXECUTION_TIME === "true")
            console.timeEnd("⏱️ m execution time");
          return data;
        } else {
          if (process.env.CONSOLE_LOGS === "true") {
            console.warn(`⚠️ Pokus ${attempt}: Vadná data. Zkouším znovu...`);
          }
          await new Promise((res) => setTimeout(res, waitBetween));
        }
      } else {
        await fs.writeFile("public/data/m_data.json", JSON.stringify(data));
        if (process.env.CONSOLE_LOGS === "true") {
          console.log(
            `✅ Data uložena (pokus ${attempt}) do m_data.json v getM.js`
          );
        }
        if (process.env.EXECUTION_TIME === "true")
          console.timeEnd("⏱️ m execution time");
        return data;
      }
    } catch (evalErr) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.error(
          `❌ Pokus ${attempt} selhal při evaluate:`,
          evalErr.message
        );
      }
      await new Promise((res) => setTimeout(res, waitBetween));
    }
  }

  throw new Error(
    "❌ Nepodařilo se získat validní m ani po několika pokusech."
  );
}
