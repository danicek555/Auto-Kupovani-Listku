export async function fillEmail(page) {
  await page.waitForSelector("#email_pickup_7", { visible: true });
  await page.type(
    "#email_pickup_7",
    process.env.CONTACT_EMAIL || "danmitka@gmail.com"
  );
  console.log(`Vyplněn email: ${process.env.CONTACT_EMAIL}`);
}
