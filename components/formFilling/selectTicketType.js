export async function selectTicketType(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Výběr typu lístku");
  }

  const maxTime = 2000;
  const interval = 10;
  const start = performance.now();

  let labels = [];

  try {
    // Čekej než se elementy objeví
    await page
      .waitForSelector('label[for="pickupTypeOption"]', { timeout: maxTime })
      .catch(() => null);

    while (performance.now() - start < maxTime) {
      labels = await page.$$('label[for="pickupTypeOption"]');

      if (labels.length >= 2) {
        // await labels[1].click(); // MOBIL-ticket
        // if (process.env.CONSOLE_LOGS === "true") {
        //   console.log("✅ Kliknuto na MOBIL-ticket.");
        // }

        await labels[0].click(); // eTicket
        if (process.env.CONSOLE_LOGS === "true") {
          console.log("✅ Kliknuto na eTicket.");
        }

        if (process.env.EXECUTION_TIME === "true") {
          console.timeEnd("⏱️ Výběr typu lístku");
        }
        return;
      }

      await new Promise((r) => setTimeout(r, interval));
    }
  } catch (error) {
    if (process.env.CONSOLE_LOGS === "true") {
      console.warn("❌ Chyba při výběru typu lístku:", error.message);
    }
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Výběr typu lístku");
  }
  if (process.env.CONSOLE_LOGS === "true") {
    console.warn("❌ Výběr typu lístku se neprovedl včas.");
  }
}
