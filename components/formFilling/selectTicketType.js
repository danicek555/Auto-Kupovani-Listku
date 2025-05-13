export async function selectTicketType(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Výběr typu lístku");
  }

  const maxTime = 5000;
  const interval = 10;
  const start = performance.now();

  let labels = [];

  try {
    // Čekej než se elementy objeví
    await page
      .waitForSelector('label[for="pickupTypeOption"]', { timeout: 5000 })
      .catch((err) =>
        console.error(
          "❌ Element 'label[for='pickupTypeOption']' v selectTicketType.js nebyl nalezen",
          err.message
        )
      );

    while (performance.now() - start < maxTime) {
      labels = await page
        .$$('label[for="pickupTypeOption"]')
        .catch((err) =>
          console.error(
            "❌ Element 'label[for='pickupTypeOption']' v selectTicketType.js nebyl nalezen",
            err.message
          )
        );

      if (labels.length >= 2) {
        // await labels[1].click(); // MOBIL-ticket
        // if (process.env.CONSOLE_LOGS === "true") {
        //   console.log("✅ Kliknuto na MOBIL-ticket.");
        // }

        await labels[0].click(); // eTicket
        if (process.env.CONSOLE_LOGS === "true") {
          console.log("✅ Kliknuto na eTicket v selectTicketType.js");
        }

        if (process.env.EXECUTION_TIME === "true") {
          console.timeEnd("⏱️ Výběr typu lístku");
        }
        return;
      }

      await new Promise((r) => setTimeout(r, interval));
    }
  } catch (error) {
    console.warn(
      "❌ Chyba při výběru typu lístku v selectTicketType.js:",
      error.message
    );
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Výběr typu lístku");
  }
}
