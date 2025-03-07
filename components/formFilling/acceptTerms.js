export async function acceptTerms(page) {
  await page.waitForSelector("#termsAccept_TicketportalTermsAccept");
  await page.evaluate(() =>
    document.querySelector("#termsAccept_TicketportalTermsAccept").click()
  );
  console.log(
    "Zaškrtnuto: Souhlasím s VŠEOBECNÉ A OBCHODNÍ PODMÍNKY A REKLAMAČNÍ ŘÁD."
  );
}
