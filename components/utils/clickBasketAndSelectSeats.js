async function clickBasketAndSelectSeats(page) {
  await selectSeats(page);
  await clickBasketButton(page);
}

export default clickBasketAndSelectSeats;
