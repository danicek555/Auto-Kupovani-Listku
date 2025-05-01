import fs from "fs";

export async function mergeData() {
  try {
    const mAll = JSON.parse(
      fs.readFileSync("public/data/m_all_data.json", "utf-8")
    );
    const m = JSON.parse(fs.readFileSync("public/data/m_data.json", "utf-8"));

    Object.keys(m).forEach((key) => {
      if (mAll[key]) {
        mAll[key].push(m[key][1]);
      } else {
        // pokud klíč neexistuje v m_all, vytvoří nový s null hodnotami kromě poslední
        mAll[key] = [
          key,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          [null],
          null,
          m[key][1],
        ];
      }
    });

    fs.writeFileSync(
      "public/data/merged_data.json",
      JSON.stringify(mAll, null, 2)
    );
    console.log(
      "✅ m_all a m data byla úspěšně spojena a uložena do merged_data.json"
    );
  } catch (error) {
    console.error("❌ Chyba při spojování dat:", error);
  }
}

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

export async function appendPricesFromPriceCategories() {
  try {
    const data = JSON.parse(
      fs.readFileSync(
        "public/data/merged_data_with_sector_labels.json",
        "utf-8"
      )
    );
    const performance = JSON.parse(
      fs.readFileSync("public/data/g_performance_data.json", "utf-8")
    );

    const priceCategories = performance.PriceCategories;

    Object.keys(data).forEach((key) => {
      const record = data[key];
      const priceCategoryId = record[3]; // 3. index je ID kategorie

      const category = priceCategories[priceCategoryId];
      const price = category?.Price ?? null;

      record.push(price); // přidáme cenu na konec
    });

    fs.writeFileSync(
      "public/data/merged_data_with_prices.json",
      JSON.stringify(data, null, 2)
    );

    console.log(
      "✅ g.performance.PriceCategories byly přidány na konec každého záznamu → merged_data_with_prices.json"
    );
  } catch (err) {
    console.error("❌ Chyba při zpracování cen:", err);
  }
}
