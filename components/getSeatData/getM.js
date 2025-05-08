import fs from "fs";

export async function getM(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ m execution time");
  }

  await page.waitForFunction('typeof m !== "undefined"');

  try {
    const data = await page.evaluate(() => {
      const obj = {};
      Object.keys(window.m).forEach((key) => {
        obj[key] = window.m[key];
      });
      return obj;
    });

    fs.writeFileSync("public/data/m_data.json", JSON.stringify(data));
    if (process.env.CONSOLE_LOGS === "true") {
      console.log("✅ Data byla úspěšně uložena do souboru m_data.json");
    }
  } catch (error) {
    if (process.env.CONSOLE_LOGS === "true") {
      console.error("❌ Evaluate failed:", error);
    }
    await page.reload({ waitUntil: "networkidle0" });
    if (process.env.CONSOLE_LOGS === "true") {
      console.log("Stránka byla znovu načtena.");
    }
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ m execution time");
  }
}
