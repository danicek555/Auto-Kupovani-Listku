import { sleep } from "../utils/sleep.js";

export async function handleCookies(page) {
  const cookieButton = await page.$("#didomi-notice-agree-button");
  if (cookieButton) {
    console.log("Nalezen cookie banner, klikám na 'Souhlasím'...");
    await cookieButton.click();
    await sleep(1000);
    console.log("Souhlas s cookies potvrzen.");
  } else {
    console.log("Cookie banner nenalezen.");
  }

  await page.evaluate(() => {
    const banner = document.getElementById("didomi-notice");
    if (banner) banner.remove();
  });

  await page.screenshot({
    path: "./screenshots/1_after_cookies.png",
    fullPage: true,
  });
}
