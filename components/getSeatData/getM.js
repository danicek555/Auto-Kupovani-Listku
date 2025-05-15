// import fs from "fs";

// export async function getM(page) {
//   if (process.env.EXECUTION_TIME === "true") {
//     console.time("⏱️ m execution time");
//   }

//   await page.waitForFunction('typeof m !== "undefined"');

//   try {
//     const data = await page.evaluate(() => {
//       const obj = {};
//       Object.keys(window.m).forEach((key) => {
//         obj[key] = window.m[key];
//       });
//       return obj;
//     });

//     fs.writeFileSync("public/data/m_data.json", JSON.stringify(data));
//     if (process.env.CONSOLE_LOGS === "true") {
//       console.log(
//         "✅ Data byla úspěšně uložena do souboru m_data.json v getM.js"
//       );
//     }
//   } catch (error) {
//     if (process.env.CONSOLE_LOGS === "true") {
//       console.error("❌ Evaluate failed:", error);
//     }
//     await page.reload({ waitUntil: "networkidle0" });
//     if (process.env.CONSOLE_LOGS === "true") {
//       console.log("Stránka byla znovu načtena.");
//     }
//   }
//   if (process.env.EXECUTION_TIME === "true") {
//     console.timeEnd("⏱️ m execution time");
//   }
// }
import fs from "fs/promises";

export async function getM(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ m execution time");
  }

  const maxAttempts = 100;
  const waitBetween = 50; // ms
  let data = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.time("cekam na m");
    await page.waitForFunction('typeof m !== "undefined"', { timeout: 10000 });
    console.timeEnd("cekam na m");

    try {
      console.time("evaluate m");
      data = await page.evaluate(() => {
        const obj = {};
        Object.keys(window.m).forEach((key) => {
          obj[key] = window.m[key];
        });
        return obj;
      });
      console.timeEnd("evaluate m");
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

        if (process.env.EXECUTION_TIME === "true") {
          console.timeEnd("⏱️ m execution time");
        }

        return data;
      } else {
        if (process.env.CONSOLE_LOGS === "true") {
          console.warn(
            `⚠️ Pokus ${attempt}: Vadná data (např. "0", "1" klíče). Zkouším znovu... v getM.js`
          );
        }
        await new Promise((res) => setTimeout(res, waitBetween));
      }
    } catch (error) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.error(
          `❌ Pokus ${attempt} selhal při načtení m:`,
          error.message
        );
      }
      await new Promise((res) => setTimeout(res, waitBetween));
    }
  }

  throw new Error(
    "❌ Nepodařilo se získat validní m ani po několika pokusech."
  );
}
