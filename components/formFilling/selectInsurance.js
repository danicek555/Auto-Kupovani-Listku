export async function selectInsurance(page) {
  await page.waitForSelector("#optionsRadiosPoistenie2", { visible: true });
  await page.evaluate(() =>
    document.querySelector("#optionsRadiosPoistenie2").click()
  );
  console.log("Zvoleno: Ne, nepotřebuji pojištění.");
}
