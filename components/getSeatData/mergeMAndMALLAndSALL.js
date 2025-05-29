// Copyright 2025 Daniel Mitka
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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
