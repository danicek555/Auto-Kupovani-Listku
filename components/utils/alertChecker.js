function alertChecker(page) {
  let retrying = false;

  page.on("console", async (msg) => {
    const text = msg.text();

    if (
      text.includes(
        "Nepodařilo se přidat místa do košíku. Představení ještě není v prodeji"
      ) &&
      !retrying
    ) {
      retrying = true;
      console.log("🔁 Alert detekován – retry výběru míst...");

      try {
        await clickBasketAndSelectSeats(page);
      } catch (err) {
        console.error("❌ Chyba při retry flow:", err.message);
      }

      retrying = false;
    }
  });
}

export default alertChecker;
