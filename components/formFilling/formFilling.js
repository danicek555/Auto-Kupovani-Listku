import selectInsurance from "./selectInsurance.js";
import selectTicketType from "./selectTicketType.js";
import fillEmail from "./fillEmail.js";
import acceptTerms from "./acceptTerms.js";
import choosePayment from "./choosePayment.js";
import submitPayment from "../action/submitPayment.js";
import confirmEmailModal from "../action/confirmEmailModal.js";

async function formFilling(page) {
  await selectInsurance(page);
  await selectTicketType(page);

  await fillEmail(page);

  await acceptTerms(page);
  await choosePayment(page);
  if (process.env.SUBMIT_PAYMENT === "true") {
    console.log(
      "⏻ Zapnuto submit payment - submitPayment.js, confirmEmailModal.js"
    );
    await submitPayment(page);
    await confirmEmailModal(page);
    const pocetListku = process.env.TICKET_COUNT;
    let sklonovaniSlovicka = "listků";
    if (pocetListku === 1) {
      sklonovaniSlovicka = "listek";
    } else if (pocetListku > 1 && pocetListku < 5) {
      sklonovaniSlovicka = "listky";
    } else {
      sklonovaniSlovicka = "listků";
    }
    console.log("🎉 Bot nakoupil " + pocetListku + " " + sklonovaniSlovicka);
  } else {
    console.log("⏻ Není zapnuto submit payment");
  }
}

export default formFilling;
