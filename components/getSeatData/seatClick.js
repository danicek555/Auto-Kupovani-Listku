import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // ⬅️ aktivuje .env
export async function seatClick(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ seatClick execution time");
  }

  let m_all;
  try {
    const fileContent = fs.readFileSync(
      "public/data/merged_data_with_prices.json",
      "utf-8"
    );
    m_all = JSON.parse(fileContent);
  } catch (err) {
    console.error(
      "❌ Chyba při čtení nebo parsování souboru 'merged_data_with_prices.json' v seatClick.js:",
      err.message
    );
    return; // Exit the function if we can't get the data
  }

  const maxCount = parseInt(process.env.TICKET_COUNT) || 3; // fallback když není v .env

  const clickedLogs = await page.evaluate(
    (m_all, maxCount) => {
      let count = 0;
      const logs = [];

      Object.keys(m_all).forEach((key) => {
        const record = m_all[key];
        if (record[10] === 0 && count < maxCount) {
          OnSeat_click(m_all[key]); // klikne na sedadlo
          logs.push(`✅ Clicked: OnSeat_click(m_all['${key}'])`);
          count++;
        }
      });

      return logs;
    },
    m_all,
    maxCount
  );

  if (process.env.CONSOLE_LOGS === "true") {
    console.log(clickedLogs.join("\n")); // výpis kliknutých ID
  }
  if (process.env.SCREENSHOTS === "true") {
    await page
      .screenshot({
        path: "./public/screenshots/3_seats_selected.png",
        fullPage: true,
      })
      .catch((err) =>
        console.error(
          "❌ Screenshot 3_seats_selected.png selhal v seatClick.js",
          err.message
        )
      );
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ seatClick execution time");
  }
}
