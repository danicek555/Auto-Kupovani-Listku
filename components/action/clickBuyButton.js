export async function clickBuyButton(page) {
  const start = Date.now();
  console.log("🔁 Začínám rychlý polling tlačítka 'Koupit'...");

  const maxTime = 2000; // max čekání (ms)
  const interval = 10; // interval mezi pokusy (ms)

  let clicked = false;

  while (Date.now() - start < maxTime) {
    clicked = await page.evaluate(() => {
      const btn = document.querySelector("a.btn.btn-buy.flex-c");
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      const duration = Date.now() - start;
      console.log(`✅ Kliknutí proběhlo za ${duration} ms.`);
      return duration;
    }

    await new Promise((r) => setTimeout(r, interval));
  }

  const total = Date.now() - start;
  console.warn(
    `❌ Tlačítko se neobjevilo do ${maxTime} ms. Čekal jsem ${total} ms.`
  );
  return null;
}
