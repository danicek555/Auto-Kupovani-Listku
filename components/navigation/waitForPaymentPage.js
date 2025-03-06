export async function waitForPaymentPage(page) {
  await page.waitForFunction(() => window.location.href.includes("Basket"));
  console.log("Stránka 'Basket' načtena.");

  await page.waitForSelector(".loading-overlay", { hidden: true }).catch(() => {
    console.warn("Loader nezmizel včas, pokračuji i tak...");
  });

  await page.setViewport({ width: 1920, height: 1080 });

  const viewport = await page.viewport();
  console.log(`Aktuální viewport: ${viewport.width}x${viewport.height}`);

  await page.screenshot({
    path: `./screenshots/6_Jsem na strance na zaplaceni.png`,
  });
}
