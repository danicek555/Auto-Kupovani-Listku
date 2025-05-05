import fs from "fs";

export async function getSAll(page) {
  console.time("s_all execution time");

  await page.waitForFunction('typeof s_all !== "undefined"');

  try {
    const data = await page.evaluate(() => {
      const obj = {};
      Object.keys(window.s_all).forEach((key) => {
        obj[key] = window.s_all[key];
      });
      return obj;
    });

    fs.writeFileSync("public/data/s_all_data.json", JSON.stringify(data));
    console.log("Data byla úspěšně uložena do souboru s_all_data.json");
  } catch (error) {
    console.error("Evaluate failed:", error);
    await page.reload({ waitUntil: "networkidle0" });
    console.log("Stránka byla znovu načtena.");
  }

  console.timeEnd("s_all execution time");
}
