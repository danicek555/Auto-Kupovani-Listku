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
