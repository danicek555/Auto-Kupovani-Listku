import fs from "fs";

export async function mergeSectorData() {
  try {
    const data = JSON.parse(
      fs.readFileSync("public/data/merged_data.json", "utf-8")
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
      "public/data/merged_data_with_sector_labels.json",
      JSON.stringify(data, null, 2)
    );

    console.log(
      "✅ s_all byly přidány na konec každého záznamu → merged_data_with_sector_labels.json"
    );
  } catch (err) {
    console.error("❌ Chyba při zpracování:", err);
  }
}
