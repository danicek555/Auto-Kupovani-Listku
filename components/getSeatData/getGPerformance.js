import fs from "fs";

export async function getGPerformance(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("GPerformance execution time");
  }

  await page.waitForFunction('typeof g_performance !== "undefined"');

  try {
    const data = await page.evaluate(() => {
      const obj = {};
      Object.keys(window.g_performance).forEach((key) => {
        obj[key] = window.g_performance[key];
      });
      return obj;
    });

    fs.writeFileSync(
      "public/data/g_performance_data.json",
      JSON.stringify(data)
    );
    if (process.env.CONSOLE_LOGS === "true") {
      console.log(
        "Data byla úspěšně uložena do souboru g_performance_data.json"
      );
    }
  } catch (error) {
    if (process.env.CONSOLE_LOGS === "true") {
      console.error("Evaluate failed:", error);
    }
    await page.reload({ waitUntil: "networkidle0" });
    if (process.env.CONSOLE_LOGS === "true") {
      console.log("Stránka byla znovu načtena.");
    }
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("GPerformance execution time");
  }
}
