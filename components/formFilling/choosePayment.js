export async function choosePayment(page) {
  await page.waitForSelector("#template_payOption_17", { visible: true });
  await page.click("#template_payOption_17");
  console.log("Zvolena platba kartou / Google Pay / Apple Pay.");
}
