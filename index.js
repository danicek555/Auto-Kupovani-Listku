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

import dotenv from "dotenv";
import { setupBrowser } from "./components/browser/setupBrowser.js";
import { clickBuyButton } from "./components/action/clickBuyButton.js";
import { selectSeats } from "./components/seat/selectSeats.js";

import setupAlertMonitor from "./components/utils/setupAlertMonitor.js";
import formFilling from "./components/formFilling/formFilling.js";
import clickBasketAndSelectSeats from "./components/utils/clickBasketAndSelectSeats.js";
import alertChecker from "./components/utils/alertChecker.js";

dotenv.config();
const TICKET_URL =
  process.env.TICKET_URL || console.log("Nezadal jsi URL do .env!!!");

async function runBot() {
  console.time("🔁 Doba spuštění botu");
  const { browser, page } = await setupBrowser(TICKET_URL); //* optimalizace done

  if (process.env.ALERT_MONITOR === "true") {
    if (process.env.EXECUTION_TIME === "true") {
      console.time("⏱️ Zapnutí alert monitoru");
    }
    await setupAlertMonitor(page);
    alertChecker(page);
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Zapnutí alert monitoru");
    }
  }

  //await handleCookies(page);

  //* CAPTCHA řešení

  // const captchaFrame = page
  //   .frames()
  //   .find((frame) => frame.url().includes("recaptcha"));
  // if (captchaFrame) {
  //   await solveCaptcha(page, captchaFrame, TICKET_URL);
  // }
  // const usesRecaptcha = await page.evaluate(
  //   () => !!document.querySelector("script[src*='recaptcha']")
  // );
  // if (usesRecaptcha) {
  //   console.log("✅ Stránka používá Google reCAPTCHA.");
  // } //TODO: musim v budoucnu udelat captcha solver
  // await closePopups(page);

  await clickBuyButton(page);
  await clickBasketAndSelectSeats(page);
  // await selectSeats(page);

  // //* STRANKA NA ZAPLACENI
  // await clickBasketButton(page);
  //await waitForPaymentPage(page);
  //await setupAlertMonitor(page);

  const success = await formFilling(page);
  if (success) {
    const pocetListku = process.env.TICKET_COUNT;
    let sklonovaniSlovicka = "listků";
    if (pocetListku === 1) {
      sklonovaniSlovicka = "lístek";
    } else if (pocetListku > 1 && pocetListku < 5) {
      sklonovaniSlovicka = "listky";
    } else {
      sklonovaniSlovicka = "listků";
    }
    console.log("🎉 Bot nakoupil " + pocetListku + " " + sklonovaniSlovicka);

    console.timeEnd("🔁 Doba spuštění botu");
  }
}

runBot().catch(console.error);
