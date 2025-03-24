import fs from "fs";

export async function getMAll(page) {
  console.time("getMAll execution time");

  await page.waitForFunction('typeof m_all !== "undefined"');

  try {
    const data = await page.evaluate(() => {
      const obj = {};
      Object.keys(window.m_all).forEach((key) => {
        obj[key] = window.m_all[key];
      });
      return obj;
    });

    fs.writeFileSync("m_all_data.json", JSON.stringify(data));
    console.log("Data byla úspěšně uložena do souboru m_all_data.json");
  } catch (error) {
    console.error("Evaluate failed:", error);
    await page.reload({ waitUntil: "networkidle0" });
    console.log("Stránka byla znovu načtena.");
  }

  console.timeEnd("getMAll execution time");
}

export async function getM(page) {
  console.time("getM execution time");

  await page.waitForFunction('typeof m !== "undefined"');

  try {
    const data = await page.evaluate(() => {
      const obj = {};
      Object.keys(window.m).forEach((key) => {
        obj[key] = window.m[key];
      });
      return obj;
    });

    fs.writeFileSync("m_data.json", JSON.stringify(data));
    console.log("Data byla úspěšně uložena do souboru m_data.json");
  } catch (error) {
    console.error("Evaluate failed:", error);
    await page.reload({ waitUntil: "networkidle0" });
    console.log("Stránka byla znovu načtena.");
  }

  console.timeEnd("getM execution time");
}
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

    fs.writeFileSync("s_all_data.json", JSON.stringify(data));
    console.log("Data byla úspěšně uložena do souboru s_all_data.json");
  } catch (error) {
    console.error("Evaluate failed:", error);
    await page.reload({ waitUntil: "networkidle0" });
    console.log("Stránka byla znovu načtena.");
  }

  console.timeEnd("s_all execution time");
}
// let allData = []; // Vytvoříme pole pro uchování dat

// export async function getMAll(page) {
//   // Čekáme, až bude proměnná `m_all` dostupná na stránce
//   await page.waitForFunction('typeof m_all !== "undefined"'); // Čekáme, až bude `m_all` definována

//   // Extrahujeme data z proměnné `m_all`
//   const data = await page.evaluate(() => {
//     console.log("Data z m_all:", window.m_all); // Debug: Zobrazíme obsah `m_all` v konzoli
//     return window.m_all; // Získáme data z proměnné `m_all` na stránce
//   });

//   // Zkontrolujeme, jestli jsou data validní
//   if (data && data.length > 0) {
//     // Přidáme data do existujícího pole
//     allData.push(...data); // Používáme spread operátor k přidání všech položek z `m_all` do `allData`

//     // Zobrazíme prvních 50 položek z pole (nebo tolik, kolik je v poli, pokud je méně než 50)
//     console.log("Prvních 50 položek z array:", allData.slice(0, 50));
//   } else {
//     console.log("m_all je prázdná nebo není ve správném formátu");
//   }
// }

//  var id_kategoria = m_all[i][3];
//    var id_sektor = m_all[i][7];
// var sedadlo = m_all[ID_Miesto_javisko][1];
// var rada = m_all[ID_Miesto_javisko][2];
// m_all.push([
//   id_miesto_javisko,
//   info_miesto,
//   info_rad,
//   id_sedadlo_kat,
//   x,
//   y + posun_y + 35,
//   0,
//   id_sektor,
// ]);

//s_all vsechny sektory

// {"135878208":[135878208,"1 ","1 ",465,205,122,180,140115019,[230,147,180,147,180,97,230,97],2],

//   "135878209":[135878209,"2 ","1 ",465,265,122,180,
//   140115019,[290,147,240,147,240,97,290,97],2],

//   "135878210":[id miesta: 135878210,sedadlo: "3 ", řada:"1 ",sektor: 465,X pozice: 325, y pozice: 122, id sektor: 180,140115019,
//   [350,147,300,147,300,97,350,97],2],
