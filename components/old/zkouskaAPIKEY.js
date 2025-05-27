import axios from "axios";

const API_KEY = "da950a402f7c6a2d6f9c1ab47207c903";

async function checkBalance() {
  try {
    const res = await axios.get("http://2captcha.com/res.php", {
      params: {
        key: API_KEY,
        action: "getbalance",
        json: 1,
      },
    });
    console.log(res.data);
  } catch (err) {
    console.error("❌ Chyba:", err.message);
  }
}

checkBalance();
