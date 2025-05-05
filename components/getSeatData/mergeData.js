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
