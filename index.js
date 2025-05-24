import { solveCaptcha } from "./components/captcha/captchaSolver.js"; // mock solver
import dotenv from "dotenv";
import { setupBrowser } from "./components/browser/setupBrowser.js";
import { clickBuyButton } from "./components/action/clickBuyButton.js";
import { selectSeats } from "./components/seat/selectSeats.js";
// import { waitForPaymentPage } from "./components/old/waitForPaymentPage.js";
import { selectInsurance } from "./components/formFilling/selectInsurance.js";
import { selectTicketType } from "./components/formFilling/selectTicketType.js";
import { fillEmail } from "./components/formFilling/fillEmail.js";
import { acceptTerms } from "./components/formFilling/acceptTerms.js";
import { choosePayment } from "./components/formFilling/choosePayment.js";
import { submitPayment } from "./components/action/submitPayment.js";
import { confirmEmailModal } from "./components/action/confirmEmailModal.js";
import { clickBasketButton } from "./components/navigation/clickBasketButton.js";
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

//** husty */
//! co musim udealt
//// tohle uz ne
