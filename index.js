import { solveCaptcha } from "./components/captchaSolver.js"; // mock solver
import dotenv from "dotenv";
import { setupBrowser } from "./components/setupBrowser.js";
import { handleCookies } from "./components/handleCookies.js";
import { closePopups } from "./components/closePopUps.js";
import { clickBuyButton } from "./components/clickBuyButton.js";
import { selectSeats } from "./components/selectSeats.js";
import { waitForPaymentPage } from "./components/navigation/waitForPaymentPage.js";
import { selectInsurance } from "./components/formFilling/selectInsurance.js";
import { selectTicketType } from "./components/formFilling/selectTicketType.js";
import { fillEmail } from "./components/formFilling/fillEmail.js";
import { acceptTerms } from "./components/formFilling/acceptTerms.js";
import { choosePayment } from "./components/formFilling/choosePayment.js";
import { submitPayment } from "./components/actions/submitPayment.js";
import { confirmEmailModal } from "./components/actions/confirmEmailModal.js";
dotenv.config();

const TICKET_URL =
  process.env.TICKET_URL || console.log("Nezdán EMAIL v .env!!!");

async function runBot() {
  const { browser, page } = await setupBrowser(TICKET_URL);

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
  await confirmEmailModal(page);
}

runBot().catch(console.error);
