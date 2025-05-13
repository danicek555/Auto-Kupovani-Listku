import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export async function seatClickFast(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ seatClickFAST execution time");
  }

  let m_data;
  try {
    const fileContent = fs.readFileSync("public/data/m_data.json", "utf-8");
    m_data = JSON.parse(fileContent);
  } catch (err) {
    console.error(
      "❌ Chyba při čtení nebo parsování souboru 'm_data.json' v seatClickFast.js:",
      err.message
    );
    return;
  }

  const maxCount = parseInt(process.env.TICKET_COUNT) || 3;

  if (process.env.CONSOLE_LOGS === "true") {
    console.log("⏻ Clicking FAST seats without screenshots v seatClickFast.js");
  }

  const clickedLogs = await page.evaluate(
    (m_data, maxCount) => {
      let count = 0;
      const logs = [];

      for (const key in m_data) {
        const [id, status] = m_data[key];

        if (status === 0 && count < maxCount) {
          try {
            if (typeof OnSeat_click !== "function") {
              throw new Error("OnSeat_click není dostupná");
            }
            OnSeat_click(m_data[key]);
            logs.push(`Clicked ID: ${id}`);
            count++;
          } catch (err) {
            logs.push(`❌ Chyba při klikání na místo ${id}: ${err.message}`);
          }
        }
      }

      return logs;
    },
    m_data,
    maxCount
  );

  if (process.env.CONSOLE_LOGS === "true") {
    console.log(clickedLogs.join("\n"));
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ seatClickFAST execution time");
  }
}
