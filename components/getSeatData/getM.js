import fs from "fs";

export async function getM(page) {
  console.time("m execution time");

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
    console.log("Data byla úspěšně uložena do souboru m_data.json");
  } catch (error) {
    console.error("Evaluate failed:", error);
    await page.reload({ waitUntil: "networkidle0" });
    console.log("Stránka byla znovu načtena.");
  }

  console.timeEnd("m execution time");
}
