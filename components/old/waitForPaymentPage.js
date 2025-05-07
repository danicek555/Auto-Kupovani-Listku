export async function waitForPaymentPage(page) {
  await page
    .waitForFunction(() => window.location.href.includes("Basket"))
    .catch((err) =>
      console.error(
        "❌ Stránka 'Basket' nebyla načtena v waitForPaymentPage.js",
        err.message
      )
    );
  console.log("Stránka 'Basket' načtena.");

  await page
    .waitForSelector(".loading-overlay", { hidden: true })
    .catch((err) =>
      console.error(
        "❌ Loader nezmizel včas, pokračuji i tak v waitForPaymentPage.js",
        err.message
      )
    );

  await page.setViewport({ width: 1920, height: 1080 });
  console.log("Aktuální URL:", await page.url());

  const viewport = await page.viewport();
  console.log(`Aktuální viewport: ${viewport.width}x${viewport.height}`);

  await page.screenshot({
    path: `./public/screenshots/6_Jsem na strance na zaplaceni.png`,
  });
}
