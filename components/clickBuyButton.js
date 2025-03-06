export async function clickBuyButton(page) {
  console.log("Čekám/Hledám tlačítko 'Koupit'...");
  const buyButton = await page.waitForSelector("a.btn.btn-buy.flex-c", {
    visible: true,
  });

  await buyButton.evaluate((el) =>
    el.scrollIntoView({ behavior: "smooth", block: "center" })
  );

  try {
    await buyButton.click();
    console.log("Kliknutí na 'Koupit' proběhlo (standardní click).");
  } catch (err) {
    console.warn(
      "Klasické kliknutí selhalo, zkouším hard click přes evaluate..."
    );
    await page.evaluate(() => {
      const button = document.querySelector("a.btn.btn-buy.flex-c");
      if (button) button.click();
    });
    console.log("Kliknutí na 'Koupit' proběhlo (hard click).");
  }
}
