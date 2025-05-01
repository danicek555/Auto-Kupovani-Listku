import { solveCaptcha } from "./components/captcha/captchaSolver.js"; // mock solver
import dotenv from "dotenv";
<<<<<<< HEAD
import { setupBrowser } from "./components/setupBrowser.js";
import { handleCookies } from "./components/handleCookies.js";
import { closePopups } from "./components/closePopUps.js";
import { clickBuyButton } from "./components/clickBuyButton.js";
import { selectSeats } from "./components/selectSeats.js";
=======
import { setupBrowser } from "./components/browser/setupBrowser.js";
import { handleCookies } from "./components/utils/handleCookies.js";
import { closePopups } from "./components/utils/closePopUps.js";
import { sleep } from "./components/utils/sleep.js";
import { clickBuyButton } from "./components/action/clickBuyButton.js";
import { selectSeats } from "./components/seat/selectSeats.js";
import { detectFreeSeats } from "./components/seat/seatDetection.js";
>>>>>>> zkouskaCisel
import { waitForPaymentPage } from "./components/navigation/waitForPaymentPage.js";
import { selectInsurance } from "./components/formFilling/selectInsurance.js";
import { selectTicketType } from "./components/formFilling/selectTicketType.js";
import { fillEmail } from "./components/formFilling/fillEmail.js";
import { acceptTerms } from "./components/formFilling/acceptTerms.js";
import { choosePayment } from "./components/formFilling/choosePayment.js";
<<<<<<< HEAD
import { submitPayment } from "./components/actions/submitPayment.js";
import { confirmEmailModal } from "./components/actions/confirmEmailModal.js";
=======
import { submitPayment } from "./components/action/submitPayment.js";
import { confirmEmailModal } from "./components/action/confirmEmailModal.js";
>>>>>>> zkouskaCisel
dotenv.config();
const TICKET_URL =
<<<<<<< HEAD
  process.env.TICKET_URL || console.log("Nezdán EMAIL v .env!!!");
=======
  process.env.TICKET_URL || console.log("Nezadal jsi URL do .env!!!");
>>>>>>> zkouskaCisel

async function runBot() {
  const { browser, page } = await setupBrowser(TICKET_URL); //* optimalizace done

<<<<<<< HEAD
  //zmezení cookies
  await handleCookies(page);

  // CAPTCHA řešení
  const captchaFrame = page
    .frames()
    .find((frame) => frame.url().includes("recaptcha"));
  if (captchaFrame) {
    await solveCaptcha(page, captchaFrame, TICKET_URL);
  }
  //await closePopups(page);

  //Kliknutí na tlačítko koupit
  await clickBuyButton(page);

  //vybrání sedadel
  await selectSeats(page);

  //STRANKA NA ZAPLACENI
  await waitForPaymentPage(page);
  await selectInsurance(page);
  await selectTicketType(page);
  await fillEmail(page);
  await acceptTerms(page);
  await choosePayment(page);
  await submitPayment(page);

  //potvrzení emailu
=======
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
>>>>>>> zkouskaCisel
  await confirmEmailModal(page);
}

runBot().catch(console.error);

//TODO: Sektory, informace o listkach, opakovani celeho programu, jaky je maximalni pocet requestu na ticket portal at to nepretizim?,
//? co captcha a recaptcha? Co to dela a potrebuju to do meho programu? Jak ticket portal blokuje boty?
//TODO: optimalizace celeho kodu aby byl RYCHLEJŠÍ!!!
//** husty */
//! co musim udealt
//// tohle uz ne
