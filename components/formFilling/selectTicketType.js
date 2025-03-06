export async function selectTicketType(page) {
  await page.waitForSelector('label[for="pickupTypeOption"]', {
    visible: true,
  });
  const labels = await page.$$('label[for="pickupTypeOption"]');
  await labels[1].click();
  console.log("Kliknuto na label pro MOBIL-ticket.");

  await labels[0].click();
  console.log("Kliknuto na label pro eTicket.");
}
