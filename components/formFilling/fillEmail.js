// export async function fillEmail(page) {
//   if (process.env.EXECUTION_TIME === "true") {
//     console.time("⏱️ Vyplňování emailu");
//   }
//   const email = process.env.CONTACT_EMAIL || "danmitka@gmail.com";

//   await page.waitForSelector("#email_pickup_7", { visible: true });

//   await page.evaluate((email) => {
//     const input = document.querySelector("#email_pickup_7");
//     if (input) input.value = email;
//   }, email);

//   if (process.env.CONSOLE_LOGS === "true") {
//     console.log(`✅ Vyplněn e-mail: ${email}`);
//   }
//   if (process.env.EXECUTION_TIME === "true") {
//     console.timeEnd("⏱️ Vyplňování emailu");
//   }
// }
export async function fillEmail(page) {
  if (process.env.EXECUTION_TIME === "true")
    console.time("⏱️ Vyplňování emailu");
  const email = process.env.CONTACT_EMAIL || "danmitka@gmail.com";

  try {
    await page
      .waitForSelector("#email_pickup_7", {
        visible: true,
        timeout: 5000,
      })
      .catch((err) =>
        console.error(
          "❌ Element 'email_pickup_7' v fillEmail.js nebyl nalezen:",
          err.message
        )
      );

    await page.$eval(
      "#email_pickup_7",
      (input, email) => {
        input.value = email;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      },
      email
    );

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(`✅ Vyplněn e-mail: ${email} v fillEmail.js`);
    }
  } catch (error) {
    console.warn(
      "❌ E-mail se nepodařilo vyplnit v fillEmail.js:",
      error.message
    );
  }

  if (process.env.EXECUTION_TIME === "true")
    console.timeEnd("⏱️ Vyplňování emailu");
}
