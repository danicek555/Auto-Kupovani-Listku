import fs from "fs";

export async function mergeMAndMALLAndSALL() {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ mergeMAndMALLAndSALL execution time");
  }

  try {
    const data = JSON.parse(
      fs.readFileSync("public/data/merged_m_all_and_m.json", "utf-8")
    );
    const s_all = JSON.parse(
      fs.readFileSync("public/data/s_all_data.json", "utf-8")
    ); // sektorová mapa

    Object.keys(data).forEach((key) => {
      const row = data[key];
      const sectorId = row[7]; // 8. prvek
      const sectorLabel = s_all[sectorId?.toString()] || "";
      row.push(sectorLabel); // přidáme číslo sektoru na konec
    });

    fs.writeFileSync(
      "public/data/merged_m_all_and_m_with_s_all.json",
      JSON.stringify(data, null, 2)
    );

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(
        "✅ s_all byly přidány na konec každého záznamu v mergeMAndMALLAndSALL.js → merged_m_all_and_m_with_s_all.json"
      );
    }
  } catch (err) {
    console.error(
      "❌ Chyba při zpracování v mergeMAndMALLAndSALL.js:",
      err.message
    );
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ mergeMAndMALLAndSALL execution time");
  }
}
