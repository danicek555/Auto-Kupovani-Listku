import { solveRecaptcha } from "./solveRecaptcha.js";

export async function startRecaptchaWatcher(page, pageUrl, intervalMs = 1000) {
  let alreadySolved = false;

  const check = async () => {
    if (alreadySolved) return;

    const frames = page.frames();
    const recaptchaFrame = frames.find((f) =>
      f.url().includes("https://www.google.com/recaptcha/api2/anchor")
    );

    if (recaptchaFrame) {
      alreadySolved = true;
      const sitekey = new URL(recaptchaFrame.url()).searchParams.get("k");
      console.log("🧩 Detekována reCAPTCHA s sitekey:", sitekey);

      const token = await solveRecaptcha(sitekey, pageUrl);
      console.log("✅ Token získán z 2captcha");

      await page.evaluate((token) => {
        let textarea = document.getElementById("g-recaptcha-response");
        if (!textarea) {
          textarea = document.createElement("textarea");
          textarea.id = "g-recaptcha-response";
          textarea.style.display = "none";
          document.body.appendChild(textarea);
        }
        textarea.innerHTML = token;
      }, token);

      console.log("✅ Token vložen do stránky");
    }
  };

  const interval = setInterval(check, intervalMs);

  // stopWatcher() můžeš volat když končíš
  return () => {
    clearInterval(interval);
    console.log("🛑 Recaptcha watcher zastaven");
  };
}
