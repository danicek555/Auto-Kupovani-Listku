// import axios from "axios";
// import dotenv from "dotenv";

// dotenv.config();

// const API_KEY = process.env.CAPTCHA_API_KEY;

export async function solveCaptcha(siteKey, url) {
  console.log(
    `[MOCK] Fake řešení CAPTCHA pro sitekey: ${siteKey} a URL: ${url}`
  );

  // Reálné volání na 2Captcha - zakomentováno
  /*
  const submitUrl = `http://2captcha.com/in.php`;
  const resultUrl = `http://2captcha.com/res.php?key=${API_KEY}&action=get&id=`;

  const response = await axios.post(submitUrl, null, {
      params: {
          key: API_KEY,
          method: "userrecaptcha",
          googlekey: siteKey,
          pageurl: url,
          json: 1,
      },
  });

  if (response.data.status !== 1) {
      throw new Error(`2Captcha error: ${response.data.request}`);
  }

  const captchaId = response.data.request;

  for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const result = await axios.get(`${resultUrl}${captchaId}&json=1`);
      if (result.data.status === 1) {
          return result.data.request;
      }
  }

  throw new Error("CAPTCHA solving timed out");
  */

  // Místo toho rovnou vrátíme fake token
  return "mock-captcha-token-123456";
}
