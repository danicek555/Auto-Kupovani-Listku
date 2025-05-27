import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.CAPTCHA_API_KEY;

export async function solveRecaptcha(sitekey, pageurl) {
  console.log("🧩 API_KEY:", API_KEY);
  console.log("🔐 Posílám CAPTCHA požadavek...");

  // Odeslání požadavku k vyřešení CAPTCHA
  const res = await axios.get("http://2captcha.com/in.php", {
    params: {
      key: API_KEY,
      method: "userrecaptcha",
      googlekey: sitekey,
      pageurl: pageurl,
      json: 1,
    },
  });

  if (res.data.status !== 1) {
    throw new Error(
      "❌ Nepodařilo se odeslat CAPTCHA požadavek: " + res.data.request
    );
  }

  const requestId = res.data.request;
  console.log("✅ CAPTCHA zadána, čekám na token... ID:", requestId);

  const maxRetries = 24;
  const delayMs = 5000;

  for (let i = 0; i < maxRetries; i++) {
    console.log(
      `⏳ Pokus ${i + 1}/${maxRetries} – čekám ${delayMs / 1000}s...`
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const result = await axios.get("http://2captcha.com/res.php", {
      params: {
        key: API_KEY,
        action: "get",
        id: requestId,
        json: 1,
      },
    });

    if (result.data.status === 1) {
      console.log("✅ Token úspěšně získán!");
      return result.data.request;
    }

    if (result.data.request !== "CAPCHA_NOT_READY") {
      throw new Error("❌ Chyba při řešení CAPTCHA: " + result.data.request);
    }
  }

  throw new Error("⏰ Vypršel čas čekání na vyřešení CAPTCHA.");
}

export default solveRecaptcha;
