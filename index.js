import { solveCaptcha } from "./components/captcha/captchaSolver.js"; // mock solver
import dotenv from "dotenv";
import { setupBrowser } from "./components/browser/setupBrowser.js";
import { handleCookies } from "./components/utils/handleCookies.js";
import { closePopups } from "./components/utils/closePopUps.js";
import { sleep } from "./components/utils/sleep.js";
import { clickBuyButton } from "./components/action/clickBuyButton.js";
import { selectSeats } from "./components/seat/selectSeats.js";
import { detectFreeSeats } from "./components/seat/seatDetection.js";
dotenv.config();

const TICKET_URL =
  process.env.TICKET_URL ||
  "https://www.ticketportal.cz/event/example-event-id";

async function runBot() {
  const { browser, page } = await setupBrowser(TICKET_URL);

  await handleCookies(page);

  await page.goto(TICKET_URL, { waitUntil: "networkidle2" });

  // CAPTCHA řešení
  const captchaFrame = page
    .frames()
    .find((frame) => frame.url().includes("recaptcha"));
  if (captchaFrame) {
    await solveCaptcha(page, captchaFrame, TICKET_URL);
  }

  await closePopups(page);

  await clickBuyButton(page);

  await page.waitForFunction(() => window.location.href.includes("idp="), {
    timeout: 10000,
  });

  await selectSeats(page);
  //STRANKA NA ZAPLACENI
  await page.waitForFunction(() => window.location.href.includes("Basket"));
  console.log("Stránka 'Basket' načtena.");

  // počkej na loader
  await page.waitForSelector(".loading-overlay", { hidden: true }).catch(() => {
    console.warn("Loader nezmizel včas, pokračuji i tak...");
  });
  //await sleep(5000);
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  // Debug vypis viewportu (jen pro kontrolu)
  await page.waitForSelector("body"); // Wait for the body element to loa
  const viewport = await page.viewport();
  console.log(`Aktuální viewport: ${viewport.width}x${viewport.height}`);
  await page.screenshot({
    path: `./public/screenshots/6_Jsem na strance na zaplaceni.png`,
    fullPage: true,
  });

  await page.waitForSelector("#optionsRadiosPoistenie2", { visible: true });
  await page.evaluate(() => {
    document.querySelector("#optionsRadiosPoistenie2").click();
  });
  console.log("Zvoleno: Ne, nepotřebuji pojištění.");

  await page.waitForSelector('label[for="pickupTypeOption"]', {
    visible: true,
  });
  const labels = await page.$$('label[for="pickupTypeOption"]'); // Vrátí všechny labely s tímto `for`
  await labels[1].click(); // 1 = druhý v pořadí (první je eTicket, druhý je MOBIL-ticket)
  console.log("Kliknuto na label pro MOBIL-ticket.");

  await page.waitForSelector('label[for="pickupTypeOption"]', {
    visible: true,
  });
  await labels[0].click(); // 1 = druhý v pořadí (první je eTicket, druhý je MOBIL-ticket)
  console.log("Kliknuto na label pro eTicket.");

  // await page.waitForSelector("#pickupTypeOptionContainer_7", { visible: true });

  await page.waitForSelector("#email_pickup_7", { visible: true });
  await page.type(
    "#email_pickup_7",
    process.env.CONTACT_EMAIL || "danmitka@gmail.com"
  );
  console.log(`Vyplněn email: ${process.env.CONTACT_EMAIL}`);

  await page.waitForSelector('input[name="ht_separe"]', { visible: true });
  await page.click('input[name="ht_separe"]');
  console.log("Zaškrtnuto: Zaslat každou vstupenku jako samostatnou přílohu.");

  await page.waitForSelector("#template_payOption_17", { visible: true });
  await page.click("#template_payOption_17");
  console.log("Zvolena platba kartou / Google Pay / Apple Pay.");

  await page.waitForSelector("#termsAccept_TicketportalTermsAccept");
  await page.evaluate(() => {
    document.querySelector("#termsAccept_TicketportalTermsAccept").click();
  });
  console.log("Kliknuto přes JS evaluate na checkbox.");

  console.log(
    "Zaškrtnuto: Souhlasím s VŠEOBECNÉ A OBCHODNÍ PODMÍNKY A REKLAMAČNÍ ŘÁD."
  );

  await page.screenshot({
    path: "./public/screenshots/7_Vyplnena stranka na zaplaceni.png",
    fullPage: true,
  });

  await page.waitForSelector("#basket-btn-zaplatit", { visible: true });
  await page.click("#basket-btn-zaplatit");
  console.log("Kliknuto na tlačítko 'Zaplatit'.");

  await page.waitForFunction(() =>
    window.location.href.includes("Basket#modalEmailOK")
  );
  console.log("Stránka s potvrzením emailu načtena.");
  await page.waitForSelector("#quick-buy-btn-confirm-confirm", {
    visible: true,
  });
  await page.screenshot({
    path: "./public/screenshots/8_Stranka s potvrzením emailu.png",
    fullPage: true,
  });
  await page.click("#quick-buy-btn-confirm-confirm");
  console.log("Kliknuto na 'Ano, potvrdit'.");

  // Tady bys normálně udělal klik:
  // const canvasBox = await canvas.boundingBox();
  // const clickX = canvasBox.x + avgX;
  // const clickY = canvasBox.y + avgY;
  // await page.mouse.click(clickX, clickY);
  // A dál podle tvého flow...

  // Hotovo

  // Tady bys normálně udělal klik:
  // const canvasBox = await canvas.boundingBox();
  // const clickX = canvasBox.x + avgX;
  // const clickY = canvasBox.y + avgY;
  // await page.mouse.click(clickX, clickY);
  // A dál podle tvého flow...

  // Hotovo
  // Dál můžeš přidat přechod do košíku atd.

  //   await page.screenshot({ path: "after_sector.png", fullPage: true });
  //   await open("after_sector.png");

  //console.log("Přejito do košíku.");
}

runBot().catch(console.error);
