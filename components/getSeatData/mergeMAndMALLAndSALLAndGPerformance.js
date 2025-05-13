import fs from "fs";

export async function mergeMAndMALLAndSALLAndGPerformance() {
  if (process.env.EXECUTION_TIME === "true") {
    console.time(
      "⏱️ MergeMAllAndMWithSectorLabelsAndGPerformance execution time"
    );
  }

  try {
    const data = JSON.parse(
      fs.readFileSync("public/data/merged_m_all_and_m_with_s_all.json", "utf-8")
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
      "public/data/merged_m_all_and_m_with_s_all_and_g_performance.json",
      JSON.stringify(data, null, 2)
    );

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(
        "✅ g.performance.PriceCategories byly přidány na konec každého záznamu v mergeMAndMALLAndSALLAndGPerformance.js → merged_m_all_and_m_with_s_all_and_g_performance.json"
      );
    }
  } catch (err) {
    console.error("❌ Chyba při zpracování cen:", err);
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd(
      "⏱️ MergeMAllAndMWithSectorLabelsAndGPerformance execution time"
    );
  }
}
