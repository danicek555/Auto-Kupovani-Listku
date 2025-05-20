import { sleep } from "./sleep.js";

async function getRecaptchaSitekey(page) {
  // Dej stránce čas na načtení iframe
  await sleep(1000); // nebo page.waitForNetworkIdle()

  const frames = page.frames();
  for (const frame of frames) {
    const url = frame.url();
    if (url.includes("https://www.google.com/recaptcha/api2/anchor")) {
      const sitekey = new URL(url).searchParams.get("k");
      if (sitekey) {
        console.log("✅ Nalezený sitekey:", sitekey);
        return sitekey;
      }
    }
  }

  throw new Error("❌ Nepodařilo se najít reCAPTCHA iframe nebo sitekey.");
}

export default getRecaptchaSitekey;
