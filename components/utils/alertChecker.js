// Copyright 2025 Daniel Mitka
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import formFilling from "../formFilling/formFilling.js";
import clickBasketAndSelectSeats from "./clickBasketAndSelectSeats.js";

function alertChecker(page) {
  let retrying = false;
  console.log("🔁 Alert checker spuštěn");
  page.on("console", async (msg) => {
    const text = msg.text();

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
    // 🟨 Chyba ve formuláři – nevybrána možnost
    if (text.includes("Prosím, vyberte jednu z možností") && !retrying) {
      retrying = true;
      console.log("🔁 Alert: chybí výběr možnosti – opakuji formFilling...");
      try {
        await formFilling(page);
      } catch (err) {
        console.error("❌ Chyba při opakování formFilling:", err.message);
      }
      retrying = false;
    }
    if (text.includes("Prosím upravte počet míst v košíku") && !retrying) {
      retrying = true;
      process.env.CONTACT_EMAIL = process.env.SECOND_CONTACT_EMAIL;
      console.log(
        "🔁 Alert: Maximum lístků na email – měním email a opakuji formFilling..."
      );
      try {
        await formFilling(page);
      } catch (err) {
        console.error("❌ Chyba při opakování formFilling:", err.message);
      }
      retrying = false;
    }
    if (text.includes("Prosíme, nenechávejte mezi místy mezeru.")) {
      console.log("🔁 Alert: nenechávejte mezi místy mezeru.");
    }
  });
}

export default alertChecker;
