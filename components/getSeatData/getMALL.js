import fs from "fs";

export async function getMAll(page) {
  console.time("m_all execution time");

  await page.waitForFunction('typeof m_all !== "undefined"');

  try {
    const data = await page.evaluate(() => {
      const obj = {};
      Object.keys(window.m_all).forEach((key) => {
        obj[key] = window.m_all[key];
      });
      return obj;
    });
    fs.writeFileSync("public/data/m_all_data.json", JSON.stringify(data));
    console.log("Data byla úspěšně uložena do souboru m_all_data.json");
  } catch (error) {
    console.error("Evaluate failed:", error);
    await page.reload({ waitUntil: "networkidle0" });
    console.log("Stránka byla znovu načtena.");
  }

  console.timeEnd("m_all execution time");
}
