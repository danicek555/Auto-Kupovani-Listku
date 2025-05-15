import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // ⬅️ aktivuje .env
export async function seatClickSlow(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ seatClickSlowexecution time");
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
        maxPrice,
        useTogether
      ) => {
        let total = 0;
        let available = 0;
        let filteredBySector = 0;
        let filteredByPrice = 0;
        let totalInSector = 0;
        let availableInSector = 0;
        const logs = [];
        const candidateSeats = [];
        let togetherNotFound = false;

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

          if (isAvailable && isCorrectSector && isCorrectPrice) {
            candidateSeats.push(record);
          }
        });

        let selectedSeats = [];

        if (useTogether)
          if (candidateSeats.length < maxCount) {
            togetherNotFound = true;
          } else {
            const byRow = {};
            candidateSeats.forEach((seat) => {
              const row = String(seat[2]).trim();
              if (!byRow[row]) byRow[row] = [];
              byRow[row].push(seat);
            });

            for (const row in byRow) {
              const sorted = byRow[row].sort(
                (a, b) => Number(a[1].trim()) - Number(b[1].trim())
              );

              for (let i = 0; i <= sorted.length - maxCount; i++) {
                const group = sorted.slice(i, i + maxCount);

                const isConsecutive =
                  group.length === maxCount &&
                  group.every((seat, idx) => {
                    if (idx === 0) return true;
                    const prevSeat = group[idx - 1];
                    return (
                      prevSeat &&
                      Number(seat[1].trim()) === Number(prevSeat[1].trim()) + 1
                    );
                  });

                if (isConsecutive) {
                  selectedSeats = group;
                  break;
                }
              }
              if (selectedSeats.length > 0) break;
            }

            if (selectedSeats.length === 0) {
              togetherNotFound = true;
            }
          }
        else {
          selectedSeats = candidateSeats.slice(0, maxCount);

          if (selectedSeats.length === 0) {
            logs.push(`❌ Nebylo nalezeno žádné vhodné místo.`);
          }
        }

        selectedSeats.forEach((record) => {
          try {
            if (typeof OnSeat_click !== "function")
              throw new Error("OnSeat_click není dostupná");

            OnSeat_click(record);
            logs.push(
              `✅ Clicked: OnSeat_click(${record[1].trim()} / řada ${
                record[2]
              }) (sektor: ${record[11]}, cena: ${record[12]}) `
            );
          } catch (err) {
            logs.push(`❌ Chyba při klikání na místo: ${err.message}`);
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
            togetherNotFound,
          },
        };
      },
      mergedData,
      maxCount,
      process.env.SEKTOR === "true",
      String(process.env.SEKTOR_NUMBER),
      process.env.PRICE === "true",
      Number(process.env.PRICE_MAX),
      process.env.TOGETHER === "true"
    );

    const { clickedLogs, totalSeats, reasonStats } = result;
    console.log("DEBUG: reasonStats", reasonStats);
    // 🔸 Nic se nevybralo vůbec
    if (clickedLogs.length === 0) {
      console.warn("⚠️ Nebylo vybráno žádné místo.");
    }
    // 🔸 Výběr byl částečný
    const clickedCount = clickedLogs.filter((line) =>
      line.startsWith("✅ Clicked:")
    ).length;

    if (clickedCount > 0 && clickedCount < maxCount) {
      console.warn(
        `⚠️ Podařilo se vybrat pouze ${clickedCount} z požadovaných ${maxCount} míst.`
      );
    }
    // 🔸 Vždy vypiš když uživatel chtěl víc, než bylo možné
    if (reasonStats.available < maxCount) {
      console.warn(
        `⚠️ K dispozici je jen ${reasonStats.available} volných míst – méně než požadovaných ${maxCount}.`
      );
    }

    // 🔸 Vždy vypiš pokud sektor vůbec neexistuje
    if (process.env.SEKTOR === "true" && reasonStats.totalInSector === 0) {
      console.warn(
        `❌ Sektor ${process.env.SEKTOR_NUMBER} neexistuje v datech.`
      );
    }

    // 🔸 I když nějaká místa jsou, může být sektor prázdný
    if (process.env.SEKTOR === "true" && reasonStats.availableInSector === 0) {
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
    // 🔸 TOGETHER failure – i když se kliklo třeba na 2 místa
    if (reasonStats.togetherNotFound) {
      console.warn(
        "❌ Nebylo možné najít skupinu sousedních sedadel ve stejné řadě."
      );
    }

    // 🔸 Cena nesedí

    // 🔸 Kombinace cena + sektor selhala
    if (
      process.env.SEKTOR === "true" &&
      process.env.PRICE === "true" &&
      clickedLogs.length === 0 &&
      reasonStats.filteredBySector + reasonStats.filteredByPrice >=
        reasonStats.available
    ) {
      console.warn(`❌ Žádná volná místa splňující kombinaci sektor + cena.`);
    }

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(clickedLogs.join("\n")); // výpis kliknutých ID
    }

    console.log("kliknul jse mtu");
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ seatClickSlow execution time");
    }

    return clickedLogs;
  }
}
