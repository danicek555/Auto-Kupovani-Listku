import { selectSeats } from "../seat/selectSeats.js";
import { clickBasketButton } from "../navigation/clickBasketButton.js";

async function clickBasketAndSelectSeats(page) {
  await selectSeats(page);
  await clickBasketButton(page);
}

export default clickBasketAndSelectSeats;
