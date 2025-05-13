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

      const keys = Object.keys(data);
      const hasValidKeys = keys.some(
        (k) => k.startsWith("-") || parseInt(k) < 0
      );

      if (hasValidKeys) {
        await fs.writeFile("public/data/m_all_data.json", JSON.stringify(data));

        if (process.env.CONSOLE_LOGS === "true") {
          console.log(`✅ Data uložena (pokus ${attempt}) do m_all_data.json`);
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
