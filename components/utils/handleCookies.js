import { sleep } from "./sleep.js";

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
<<<<<<< HEAD:components/handleCookies.js
    path: "./screenshots/2_after_cookies.png",
=======
    path: "./public/screenshots/1_after_cookies.png",
>>>>>>> zkouskaCisel:components/utils/handleCookies.js
    fullPage: true,
  });
}
