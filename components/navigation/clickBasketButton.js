export async function clickBasketButton(page) {
  if (process.env.CONSOLE_LOGS === "true") {
    console.log(
      "🔁 Začínám rychlý polling tlačítka 'Pokračovat do košíku'... v clickBasketButton.js"
    );
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }

  const interval = 10;
  const maxAttempts = 20;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const button = await page.$("#hladisko-basket-btn");
    if (!button) {
      console.error(
        "❌ Element 'hladisko-basket-btn' v clickBasketButton.js nebyl nalezen"
      );
      await new Promise((resolve) => setTimeout(resolve, interval));
      continue;
    }

    await button.click();

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(
        `✅ Pokus #${attempt}: Kliknutí provedeno, čekám na /Basket...`
      );
    }

    try {
      await page.waitForFunction(() => location.pathname.includes("/Basket"), {
        timeout: 3000,
      });

      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Detekováno přesměrování na /Basket.");
      }

      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
      }

      return attempt;
    } catch (e) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.warn("⚠️ URL se nezměnila, zkouším znovu...");
      }
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  console.warn(
    `❌ Nepodařilo se kliknout na tlačítko nebo přesměrovat na /Basket po ${maxAttempts} pokusech.`
  );

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Doba kliknutí na 'Pokračovat do košíku'");
  }

  return null;
}
export default clickBasketButton;
