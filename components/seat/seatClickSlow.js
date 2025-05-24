import fs from "fs";
import dotenv from "dotenv";

dotenv.config(); // ⬅️ aktivuje .env
export async function seatClickSlow(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ seatClickSlow execution time");
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

        const hasValidPrice = record[12] !== null && !isNaN(Number(record[12]));
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

      if (useTogether) {
        if (candidateSeats.length < maxCount) {
          togetherNotFound = true;
        } else {
          const bySectorAndRow = {};

          candidateSeats.forEach((seat) => {
            const sector = String(seat[11]).trim();
            const row = String(seat[2]).trim();
            const key = `${sector}-${row}`;

            if (!bySectorAndRow[key]) bySectorAndRow[key] = [];
            bySectorAndRow[key].push(seat);
          });

          for (const key in bySectorAndRow) {
            const sorted = bySectorAndRow[key].sort(
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
                const getSeatNum = (seat) => Number(seat[1].trim());
                const isFree = (seat) => seat[10] === 0;

                for (const key in bySectorAndRow) {
                  const sorted = bySectorAndRow[key].sort(
                    (a, b) => getSeatNum(a) - getSeatNum(b)
                  );

                  for (let i = 0; i <= sorted.length - maxCount; i++) {
                    let group = sorted.slice(i, i + maxCount);

                    const isConsecutive =
                      group.length === maxCount &&
                      group.every(
                        (seat, idx) =>
                          idx === 0 ||
                          getSeatNum(seat) === getSeatNum(group[idx - 1]) + 1
                      );

                    if (!isConsecutive) continue;

                    let shiftLeftPossible = i > 0;
                    let shiftRightPossible = i + maxCount < sorted.length;

                    let shiftDirection = null;

                    // Check for lonely gaps
                    const lonelyLeft =
                      shiftLeftPossible &&
                      isFree(sorted[i - 1]) &&
                      (!sorted[i - 2] || !isFree(sorted[i - 2]));
                    const lonelyRight =
                      shiftRightPossible &&
                      isFree(sorted[i + maxCount]) &&
                      (!sorted[i + maxCount + 1] ||
                        !isFree(sorted[i + maxCount + 1]));

                    if (lonelyLeft && shiftRightPossible)
                      shiftDirection = "right";
                    if (lonelyRight && shiftLeftPossible)
                      shiftDirection = "left";

                    if (shiftDirection === "left") {
                      const tryLeft = sorted.slice(i - 1, i - 1 + maxCount);
                      if (
                        tryLeft.length === maxCount &&
                        tryLeft.every(
                          (seat, idx) =>
                            idx === 0 ||
                            getSeatNum(seat) ===
                              getSeatNum(tryLeft[idx - 1]) + 1
                        ) &&
                        tryLeft.every(isFree)
                      ) {
                        group = tryLeft;
                      }
                    } else if (shiftDirection === "right") {
                      const tryRight = sorted.slice(i + 1, i + 1 + maxCount);
                      if (
                        tryRight.length === maxCount &&
                        tryRight.every(
                          (seat, idx) =>
                            idx === 0 ||
                            getSeatNum(seat) ===
                              getSeatNum(tryRight[idx - 1]) + 1
                        ) &&
                        tryRight.every(isFree)
                      ) {
                        group = tryRight;
                      }
                    }

                    selectedSeats = group;
                    break;
                  }
                }
              }
            }
            if (selectedSeats.length > 0) break;
          }

          if (selectedSeats.length === 0) {
            togetherNotFound = true;
          }
        }
      } else {
        selectedSeats = candidateSeats.slice(0, maxCount);

        if (selectedSeats.length === 0) {
          logs.push(`❌ Nebylo nalezeno žádné vhodné místo.`);
        }
      }

      selectedSeats.forEach(async (record) => {
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
    console.warn(`❌ Sektor ${process.env.SEKTOR_NUMBER} neexistuje v datech.`);
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
  if (process.env.SCREENSHOTS === "true") {
    if (process.env.EXECUTION_TIME === "true") {
      console.time(
        "⏱️ Vytvoření screenshotu 3_seats_selected.png v seatClickSlow.js"
      );
    }
    await page
      .screenshot({
        path: `./public/screenshots/3_seats_selected.png`,
        fullPage: true,
      })
      .catch((err) =>
        console.error(
          "❌ Screenshot 3_seats_selected.png selhal v seatClickSlow.js",
          err.message
        )
      );
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd(
        "⏱️ Vytvoření screenshotu 3_seats_selected.png v seatClickSlow.js"
      );
    }
    if (process.env.EXECUTION_TIME === "true") {
      console.time(
        "⏱️ Vytvoření screenshotu 4_seats_selected_canvas.png v seatClickSlow.js"
      );
      const canvas = await page.$("#canvas");
      await canvas
        .screenshot({
          path: "./public/screenshots/4_seats_selected_canvas.png",
        })
        .catch((err) =>
          console.error(
            "❌ Screenshot 4_seats_selected_canvas.png selhal v seatClickSlow.js",
            err.message
          )
        );
      console.timeEnd(
        "⏱️ Vytvoření screenshotu 4_seats_selected_canvas.png v seatClickSlow.js"
      );
    }
  }
  console.log("kliknul jse mtu");
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ seatClickSlow execution time");
  }

  return clickedLogs;
}
