import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // ⬅️ aktivuje .env
export async function seatClick(page) {
  const start = Date.now(); // začátek měření
  const m_all = JSON.parse(
    fs.readFileSync("public/data/merged_data_with_prices.json", "utf-8")
  );
  const maxCount = parseInt(process.env.TICKET_COUNT) || 3; // fallback když není v .env

  const clickedLogs = await page.evaluate(
    (m_all, maxCount) => {
      let count = 0;
      const logs = [];

      Object.keys(m_all).forEach((key) => {
        const record = m_all[key];
        if (record[10] === 0 && count < maxCount) {
          OnSeat_click(m_all[key]); // klikne na sedadlo
          logs.push(`Clicked: OnSeat_click(m_all['${key}'])`);
          count++;
        }
      });

      return logs;
    },
    m_all,
    maxCount
  );

  const end = Date.now();
  const durationMs = end - start;

  console.log(clickedLogs.join("\n")); // výpis kliknutých ID
  console.log(`⏱️ Trvalo to ${durationMs} ms`);
}
