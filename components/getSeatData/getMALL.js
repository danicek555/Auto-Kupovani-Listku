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

export async function getMAll(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ m_all execution time");
  }

  const maxAttempts = 10;
  const waitBetween = 50; // ms
  let data = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.waitForFunction('typeof m_all !== "undefined"');

    try {
      data = await page.evaluate(() => {
        const obj = {};
        Object.keys(window.m_all).forEach((key) => {
          obj[key] = window.m_all[key];
        });
        return obj;
      });

      if (process.env.SECURE_DATA === "true") {
        console.log("Zapl jsem secure");
        const keys = Object.keys(data);
        const hasValidKeys = keys.some(
          (k) => k.startsWith("-") || parseInt(k) < 0
        );
        if (hasValidKeys) {
          await fs.writeFile(
            "public/data/m_all_data.json",
            JSON.stringify(data)
          );
          if (process.env.CONSOLE_LOGS === "true") {
            console.log(
              `✅ Data uložena (pokus ${attempt}) do m_all_data.json v getMALL.js`
            );
          }
          if (process.env.EXECUTION_TIME === "true") {
            console.timeEnd("⏱️ m_all execution time");
          }
          return data;
        } else {
          if (process.env.CONSOLE_LOGS === "true") {
            console.warn(
              `⚠️ Pokus ${attempt}: Vadná data (např. "0", "1" klíče). Zkouším znovu... v getMALL.js`
            );
          }
          await new Promise((res) => setTimeout(res, waitBetween));
        }
      } else {
        await fs.writeFile("public/data/m_all_data.json", JSON.stringify(data));
        if (process.env.CONSOLE_LOGS === "true") {
          console.log(
            `✅ Data uložena (pokus ${attempt}) do m_all_data.json v getMALL.js`
          );
        }
        if (process.env.EXECUTION_TIME === "true") {
          console.timeEnd("⏱️ m_all execution time");
        }
        return data;
      }
    } catch (err) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.error(
          `❌ Pokus ${attempt} selhal při načtení m_all:`,
          err.message
        );
      }
      await new Promise((res) => setTimeout(res, waitBetween));
    }
  }

  throw new Error(
    "❌ Nepodařilo se získat validní m_all ani po několika pokusech."
  );
}
