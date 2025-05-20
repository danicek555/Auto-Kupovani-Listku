import axios from "axios";

const API_KEY = process.env.CAPTCHA_API_KEY;

export async function solveRecaptcha(sitekey, pageurl) {
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
      "Nepodařilo se odeslat CAPTCHA požadavek: " + res.data.request
    );
  }

  const requestId = res.data.request;

  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const result = await axios.get("http://2captcha.com/res.php", {
      params: {
        key: API_KEY,
        action: "get",
        id: requestId,
        json: 1,
      },
    });

    if (result.data.status === 1) {
      return result.data.request;
    }

    if (result.data.request !== "CAPCHA_NOT_READY") {
      throw new Error("Chyba při řešení CAPTCHA: " + result.data.request);
    }
  }

  throw new Error("Vypršel čas čekání na CAPTCHA.");
}
export default solveRecaptcha;
