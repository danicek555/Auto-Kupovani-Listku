export async function clickBasketButton(page) {
  const start = Date.now();
  console.log("🔁 Začínám rychlý polling tlačítka 'Pokračovat do košíku'...");

  const maxTime = 2000; // maximální doba čekání (v ms)
  const interval = 10; // interval mezi pokusy (v ms)

  let clicked = false;

  while (Date.now() - start < maxTime) {
    clicked = await page.evaluate(() => {
      const btn = document.querySelector("#hladisko-basket-btn");
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      const duration = Date.now() - start;
      console.log(
        `✅ Kliknutí na 'Pokračovat do košíku' proběhlo za ${duration} ms.`
      );
      return duration;
    }

    await page.waitForTimeout(interval);
  }

  const total = Date.now() - start;
  console.warn(
    `❌ Tlačítko se neobjevilo do ${maxTime} ms. Čekal jsem ${total} ms.`
  );
  return null;
}
