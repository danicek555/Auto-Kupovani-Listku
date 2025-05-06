export async function fillEmail(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Vyplňování emailu");
  }
  const email = process.env.CONTACT_EMAIL || "danmitka@gmail.com";

  await page.waitForSelector("#email_pickup_7", { visible: true });

  await page.evaluate((email) => {
    const input = document.querySelector("#email_pickup_7");
    if (input) input.value = email;
  }, email);

  if (process.env.CONSOLE_LOGS === "true") {
    console.log(`✅ Vyplněn e-mail: ${email}`);
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Vyplňování emailu");
  }
}
