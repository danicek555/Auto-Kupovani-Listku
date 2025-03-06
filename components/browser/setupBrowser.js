import puppeteer from "puppeteer";

export async function setupBrowser(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
  );

  await page.goto(url, { waitUntil: "networkidle2" });

  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  await page.evaluate(() => {
    document.body.style.transform = "scale(1)";
    document.body.style.transformOrigin = "top left";
  });

  await page.screenshot({
    path: "./public/screenshots/0_site.png",
    fullPage: true,
  });

  return { browser, page };
}
