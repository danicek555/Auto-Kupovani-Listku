import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // ⬅️ aktivuje .env
export async function seatClick(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("seatClick execution time");
  }

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

  if (process.env.CONSOLE_LOGS === "true") {
    console.log(clickedLogs.join("\n")); // výpis kliknutých ID
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("seatClick execution time");
  }
}
