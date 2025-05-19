import fs from "fs/promises";

export async function getSAll(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ s_all execution time");
  }

  const maxAttempts = 10;
  const waitBetween = 50; // ms
  let data = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.waitForFunction('typeof s_all !== "undefined"');

    try {
      data = await page.evaluate(() => {
        const obj = {};
        Object.keys(window.s_all).forEach((key) => {
          obj[key] = window.s_all[key];
        });
        return obj;
      });

      await fs.writeFile("public/data/s_all_data.json", JSON.stringify(data));

      if (process.env.CONSOLE_LOGS === "true") {
        console.log(
          `✅ Data uložena (pokus ${attempt}) do s_all_data.json v getSALL.js`
        );
      }

      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ s_all execution time");
      }

      return data;
    } catch (error) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.error(
          `❌ Pokus ${attempt} selhal při načtení s_all:`,
          error.message
        );
      }
      await new Promise((res) => setTimeout(res, waitBetween));
    }
  }

  throw new Error("❌ Nepodařilo se získat s_all ani po několika pokusech.");
}
