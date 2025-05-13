import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // ⬅️ aktivuje .env
export async function seatClickSlow(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ seatClick execution time");
  }

  let mergedData;
  try {
    const fileContent = fs.readFileSync(
      "public/data/merged_m_all_and_m_with_s_all_and_g_performance.json",
      "utf-8"
    );

    mergedData = JSON.parse(fileContent);
    //console.log("jsem tu");
  } catch (err) {
    console.error(
      "❌ Chyba při čtení nebo parsování souboru 'merged_m_all_and_m_with_s_all_and_g_performance.json' v seatClick.js:",
      err.message
    );
    return; // Exit the function if we can't get the data
  }

  const maxCount = parseInt(process.env.TICKET_COUNT) || 3; // fallback když není v .env

  let clickedLogs = [];

  if (process.env.SCREENSHOTS === "true") {
    if (process.env.CONSOLE_LOGS === "true") {
      console.log("⏻ Clicking seats with screenshots v seatClick.js");
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
      if (process.env.CONSOLE_LOGS === "true") {
        console.log(`✅ Screenshot saved: seat_click${i}.png`);
      }
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd(`⏱️ Screenshot ${i}`);
      }
    }
    if (process.env.EXECUTION_TIME === "true") {
      console.time("⏱️ Screenshot 3_seats_selected.png v seatClick.js");
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
      console.timeEnd("⏱️ Screenshot 3_seats_selected.png v seatClick.js");
    }
  } else {
    console.log("jsem tu");
    // Faster version without screenshots
    if (process.env.CONSOLE_LOGS === "true") {
      console.log("⏻ Clicking seats without screenshots v seatClick.js");
    }

    const hasFunction = await page.evaluate(
      () => typeof OnSeat_click === "function"
    );

    if (process.env.CONSOLE_LOGS === "true") {
      console.log("OnSeat_click dostupná?", hasFunction, "v seatClick.js");
    }

    const result = await page.evaluate(
      (
        mergedData,
        maxCount,
        useSectorFilter,
        allowedSector,
        usePriceFilter,
        maxPrice
      ) => {
        let count = 0;
        const logs = [];
        let filteredBySector = 0;
        let filteredByPrice = 0;
        let total = 0;
        let available = 0;
        let totalInSector = 0;
        let availableInSector = 0;

        Object.keys(mergedData).forEach((key) => {
          const record = mergedData[key];
          total++;

          const isAvailable = record[10] === 0;
          if (isAvailable) available++;

          const inTargetSector = String(record[11]) === String(allowedSector);
          const isCorrectSector = !useSectorFilter || inTargetSector;
          if (useSectorFilter && !isCorrectSector) filteredBySector++;

          const hasValidPrice =
            record[12] !== null && !isNaN(Number(record[12]));
          const isCorrectPrice =
            !usePriceFilter ||
            (hasValidPrice && Number(record[12]) <= Number(maxPrice));
          if (
            usePriceFilter &&
            (!hasValidPrice || Number(record[12]) > Number(maxPrice))
          ) {
            filteredByPrice++;
          }

          if (useSectorFilter && inTargetSector) {
            totalInSector++;
            if (isAvailable) availableInSector++;
          }

          if (
            isAvailable &&
            isCorrectSector &&
            isCorrectPrice &&
            count < maxCount
          ) {
            try {
              if (typeof OnSeat_click !== "function")
                throw new Error("OnSeat_click není dostupná");

              OnSeat_click(record);
              logs.push(
                `✅ Clicked: OnSeat_click(mergedData['${key}']) (sektor: ${record[11]}, cena: ${record[12]})`
              );
              count++;
            } catch (err) {
              logs.push(`❌ Chyba při klikání na místo: ${err.message}`);
            }
          }
        });

        return {
          clickedLogs: logs,
          totalSeats: total,
          reasonStats: {
            available,
            filteredBySector,
            filteredByPrice,
            totalInSector,
            availableInSector,
          },
        };
      },
      mergedData,
      maxCount,
      process.env.SEKTOR === "true",
      String(process.env.SEKTOR_NUMBER), // ✅ jasně definovaný sektor jako string
      process.env.PRICE === "true",
      Number(process.env.PRICE_MAX) // ✅ cena jako číslo, i když 0
    );
    const { clickedLogs, totalSeats, reasonStats } = result;
    console.log("DEBUG: reasonStats", reasonStats);

    if (clickedLogs.length === 0) {
      console.warn("⚠️ Nebylo vybráno žádné místo. Důvody:");

      if (reasonStats.available === 0) {
        console.warn("⛔ Není žádné volné místo.");
      } else {
        if (process.env.SEKTOR === "true" && reasonStats.totalInSector === 0) {
          console.warn(
            `❌ Sektor ${process.env.SEKTOR_NUMBER} neexistuje v datech.`
          );
        } else if (
          process.env.SEKTOR === "true" &&
          reasonStats.availableInSector === 0
        ) {
          console.warn(
            `❌ V sektoru ${process.env.SEKTOR_NUMBER} nejsou žádná volná místa.`
          );
        }

        if (
          process.env.PRICE === "true" &&
          reasonStats.available > 0 &&
          clickedLogs.length === 0
        ) {
          console.warn(
            `❌ Žádná volná místa s cenou do ${process.env.PRICE_MAX} Kč.`
          );
        }

        if (
          process.env.SEKTOR === "true" &&
          process.env.PRICE === "true" &&
          reasonStats.filteredBySector + reasonStats.filteredByPrice >=
            reasonStats.available
        ) {
          console.warn(
            `❌ Žádná volná místa splňující kombinaci sektor + cena.`
          );
        }
      }
    }

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(clickedLogs.join("\n")); // výpis kliknutých ID
    }

    console.log("kliknul jse mtu");
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ seatClick execution time");
    }

    return clickedLogs;
  }
}
