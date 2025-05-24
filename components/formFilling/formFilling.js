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
    const emailConfirmed = await confirmEmailModal(page);
    return emailConfirmed;
  } else {
    console.log("⏻ Není zapnuto submit payment");
  }
}

export default formFilling;
