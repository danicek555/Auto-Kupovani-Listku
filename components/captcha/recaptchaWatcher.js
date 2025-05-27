import { solveRecaptcha } from "./solveRecaptcha.js";

export async function startRecaptchaWatcher(page, pageUrl) {
  const frames = page.frames();
  const recaptchaFrame = frames.find((f) =>
    f.url().includes("https://www.google.com/recaptcha/api2/anchor")
  );

  if (!recaptchaFrame) {
    throw new Error("❌ reCAPTCHA iframe nenalezen");
  }

  const sitekey = new URL(recaptchaFrame.url()).searchParams.get("k");
  if (!sitekey) {
    throw new Error("❌ Nepodařilo se získat sitekey z iframe URL");
  }

  console.log("🧩 Detekována reCAPTCHA s sitekey:", sitekey);

  try {
    const token = await solveRecaptcha(sitekey, pageUrl);
    console.log("✅ Token získán z 2captcha:", token);

    await page.evaluate((token) => {
      let textarea = document.getElementById("g-recaptcha-response");
      if (!textarea) {
        textarea = document.createElement("textarea");
        textarea.id = "g-recaptcha-response";
        textarea.name = "g-recaptcha-response";
        textarea.style.display = "none";
        document.body.appendChild(textarea);
      }
      textarea.value = token;
    }, token);

    console.log("✅ Token vložen do stránky");
  } catch (err) {
    console.error("❌ Chyba při řešení CAPTCHA:", err.message);
    throw err;
  }
}
