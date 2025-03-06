import { sleep } from "../utils/sleep.js";

// Mock řešení CAPTCHA
export async function solveCaptcha(page, captchaFrame, url) {
  console.log("CAPTCHA detected, solving (mock)...");

  const siteKey = captchaFrame.url().match(/k=([^&]*)/)[1];
  const captchaSolution = await mockSolveCaptcha(siteKey, url);

  await page.evaluate(`
    document.getElementById("g-recaptcha-response").innerHTML="${captchaSolution}";
  `);

  await page.screenshot({
    path: "./screenshots/2_after_captcha.png",
    fullPage: true,
  });
  console.log("CAPTCHA vyřešena (mock).");

  const submitButton = await page.$('button[type="submit"]');
  if (submitButton) {
    console.log("Klikám na submit button po CAPTCHA...");
    // await submitButton.click();
  } else {
    console.log("Žádný submit button nenalezen - pokračuju dál.");
  }
}

// Mockovaná funkce na řešení CAPTCHA (jen placeholder)
async function mockSolveCaptcha(siteKey, url) {
  await sleep(1000);
  return "mock-captcha-solution";
}
