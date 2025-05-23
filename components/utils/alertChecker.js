import formFilling from "../formFilling/formFilling.js";
import clickBasketAndSelectSeats from "./clickBasketAndSelectSeats.js";

function alertChecker(page) {
  let retrying = false;
  console.log("🔁 Alert checker spuštěn");
  page.on("console", async (msg) => {
    const text = msg.text();
    // console.log("🔁 Alert checker detekoval:", text);

    // 🟥 Alert: Ještě není v prodeji
    if (
      text.includes(
        "Nepodařilo se přidat místa do košíku. Představení ještě není v prodeji"
      ) &&
      !retrying
    ) {
      retrying = true;
      console.log("🔁 Alert: ještě není v prodeji – retry výběru míst...");
      try {
        await clickBasketAndSelectSeats(page);
        await formFilling(page);
      } catch (err) {
        console.error(
          "❌ Chyba při retry flow (ještě není v prodeji):",
          err.message
        );
      }
      retrying = false;
    }

    // 🟧 Alert: Místo je obsazené
    if (text.includes("Místo je obsazené") && !retrying) {
      retrying = true;
      console.log("🔁 Alert: místo obsazené – retry výběru jiných míst...");
      try {
        await clickBasketAndSelectSeats(page);
        await formFilling(page);
      } catch (err) {
        console.error("❌ Chyba při retry flow (místo obsazené):", err.message);
      }
      retrying = false;
    }
  });
}

export default alertChecker;
