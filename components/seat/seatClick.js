import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // ⬅️ aktivuje .env
export async function seatClick(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ seatClick execution time");
  }

  let mergedData;
  try {
    const fileContent = fs.readFileSync(
      "public/data/merged_data_with_prices.json",
      "utf-8"
    );
    mergedData = JSON.parse(fileContent);
    //console.log("jsem tu");
  } catch (err) {
    console.error(
      "❌ Chyba při čtení nebo parsování souboru 'merged_data_with_prices.json' v seatClick.js:",
      err.message
    );
    return; // Exit the function if we can't get the data
  }

  const maxCount = parseInt(process.env.TICKET_COUNT) || 3; // fallback když není v .env

  let clickedLogs = [];

  if (process.env.SCREENSHOTS === "true") {
    if (process.env.CONSOLE_LOGS === "true") {
      console.log("🔍 Clicking seats with screenshots v seatClick.js");
    }
    // Slower version with screenshots
    const seatsData = await page.evaluate(
      (mergedData, maxCount) => {
        let count = 0;
        const seatsToClick = [];

        Object.keys(mergedData).forEach((key) => {
          const record = mergedData[key];
          if (record[10] === 0 && count < maxCount) {
            seatsToClick.push(key);
            count++;
          }
        });

        return seatsToClick;
      },
      mergedData,
      maxCount
    );

    for (let i = 0; i < seatsData.length; i++) {
      const key = seatsData[i];
      if (process.env.EXECUTION_TIME === "true") {
        console.time(`⏱️ Screenshot ${i}`);
      }
      await page.screenshot({
        path: `./public/seat/before/seat_click${i}.png`,
        fullPage: true,
      });

      await page.evaluate(
        (key, mergedData) => {
          OnSeat_click(mergedData[key]);
        },
        key,
        mergedData
      );

      clickedLogs.push(`✅ Clicked: OnSeat_click(mergedData['${key}'])`);

      await page.screenshot({
        path: `./public/seat/after/seat_click${i}.png`,
        fullPage: true,
      });
      console.log(`✅ Screenshot saved: seat_click${i}.png`);
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd(`⏱️ Screenshot ${i}`);
      }
    }
    if (process.env.EXECUTION_TIME === "true") {
      console.time("⏱️ Screenshot 3_seats_selected.png");
    }
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
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Screenshot 3_seats_selected.png");
    }
  } else {
    // Faster version without screenshots
    if (process.env.CONSOLE_LOGS === "true") {
      console.log("🔍 Clicking seats without screenshots v seatClick.js");
    }
    const hasFunction = await page.evaluate(
      () => typeof OnSeat_click === "function"
    );
    if (process.env.CONSOLE_LOGS === "true") {
      console.log("OnSeat_click dostupná?", hasFunction, "v seatClick.js");
    }

    //console.log("jsem tu 2");
    clickedLogs = await page.evaluate(
      (mergedData, maxCount) => {
        let count = 0;
        const logs = [];

        Object.keys(mergedData).forEach((key) => {
          const record = mergedData[key];

          if (record[10] === 0 && count < maxCount) {
            try {
              if (typeof OnSeat_click !== "function")
                throw new Error("OnSeat_click není dostupná");
              OnSeat_click(mergedData[key]);
              logs.push(`Clicked: OnSeat_click(mergedData['${key}'])`);
              count++;
            } catch (err) {
              logs.push(`❌ Chyba při klikání na místo: ${err.message}`);
            }
          }
        });

        return logs;
      },
      mergedData,
      maxCount
    );
  }
  if (process.env.CONSOLE_LOGS === "true") {
    console.log(clickedLogs.join("\n")); // výpis kliknutých ID
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ seatClick execution time");
  }

  return clickedLogs;
}
