import { solveCaptcha } from "./components/captcha/captchaSolver.js"; // mock solver
import dotenv from "dotenv";
import { setupBrowser } from "./components/browser/setupBrowser.js";
import { clickBuyButton } from "./components/action/clickBuyButton.js";
import { selectSeats } from "./components/seat/selectSeats.js";
import { waitForPaymentPage } from "./components/navigation/waitForPaymentPage.js";
import { selectInsurance } from "./components/formFilling/selectInsurance.js";
import { selectTicketType } from "./components/formFilling/selectTicketType.js";
import { fillEmail } from "./components/formFilling/fillEmail.js";
import { acceptTerms } from "./components/formFilling/acceptTerms.js";
import { choosePayment } from "./components/formFilling/choosePayment.js";
import { submitPayment } from "./components/action/submitPayment.js";
import { confirmEmailModal } from "./components/action/confirmEmailModal.js";

dotenv.config();
const TICKET_URL =
  process.env.TICKET_URL || console.log("Nezadal jsi URL do .env!!!");

async function runBot() {
  const { browser, page } = await setupBrowser(TICKET_URL); //* optimalizace done

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
  await selectSeats(page);

  //* STRANKA NA ZAPLACENI
  await waitForPaymentPage(page);
  await selectInsurance(page);
  await selectTicketType(page);
  await fillEmail(page);
  await acceptTerms(page);
  await choosePayment(page);
  await submitPayment(page);
  await confirmEmailModal(page);
}

runBot().catch(console.error);

//TODO: Sektory, informace o listkach, opakovani celeho programu, jaky je maximalni pocet requestu na ticket portal at to nepretizim?,
//? co captcha a recaptcha? Co to dela a potrebuju to do meho programu? Jak ticket portal blokuje boty?
//TODO: optimalizace celeho kodu aby byl RYCHLEJŠÍ!!!
//** husty */
//! co musim udealt
//// tohle uz ne
