import puppeteer from "puppeteer";
import { solveCaptcha } from "./captchaSolver.js"; // mock solver
import dotenv from "dotenv";
import open from "open";
const Jimp = require("jimp");

dotenv.config();

const TICKET_URL =
  process.env.TICKET_URL ||
  "https://www.ticketportal.cz/event/example-event-id";

async function runBot() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
  );

  await page.goto(TICKET_URL, { waitUntil: "networkidle2" });
  // Nastav viewport na 1920x1080
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1, // 1 = normální zoom
  });

  // Nebo alternativa, když je potřeba hard reset:
  await page.evaluate(() => {
    document.body.style.transform = "scale(1)";
    document.body.style.transformOrigin = "top left";
  });
  await page.screenshot({ path: "before_cookies.png", fullPage: true });

  const cookieButton = await page.$("#didomi-notice-agree-button");
  if (cookieButton) {
    console.log("Nalezen cookie banner (Didomi), klikám na 'Souhlasím'...");
    await cookieButton.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Souhlas s cookies potvrzen.");
  } else {
    console.log("Cookie banner nenalezen.");
  }

  await page.evaluate(() => {
    const banner = document.getElementById("didomi-notice");
    if (banner) banner.remove();
  });

  await page.screenshot({ path: "after_cookies.png", fullPage: true });
  //await open("after_cookies.png");

  // CAPTCHA řešení (mock)
  const captchaFrame = page
    .frames()
    .find((frame) => frame.url().includes("recaptcha"));
  if (captchaFrame) {
    console.log("CAPTCHA detected, solving (mock)...");

    const siteKey = captchaFrame.url().match(/k=([^&]*)/)[1];
    const captchaSolution = await solveCaptcha(siteKey, TICKET_URL);

    await page.evaluate(
      `document.getElementById("g-recaptcha-response").innerHTML="${captchaSolution}";`
    );

    await page.screenshot({ path: "after_captcha.png", fullPage: true });
    console.log("CAPTCHA vyřešena (mock).");

    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      console.log("Klikám na submit button po CAPTCHA...");
      //await submitButton.click();
    } else {
      console.log("Žádný submit button nenalezen - pokračuju dál.");
    }
  }

  // Po CAPTCHA nebo rovnou pokračujeme k lístkům
  //await page.waitForSelector(".tickets-list", { timeout: 10000 });

  // Pop-up close handling (kdyby tam byl)
  const closePopup = await page.$(".popup-close-btn");
  if (closePopup) {
    await closePopup.click();
    console.log("Zavírám pop-up.");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Teď ten kritický krok - klikání na tlačítko "Koupit"
  console.log("Čekám na tlačítko 'Koupit'...");
  const buyButton = await page.waitForSelector("a.btn.btn-buy.flex-c", {
    visible: true,
  });

  await buyButton.evaluate((el) =>
    el.scrollIntoView({ behavior: "smooth", block: "center" })
  );

  try {
    await buyButton.click();
    console.log("Kliknutí na 'Koupit' proběhlo (standardní click).");
  } catch (err) {
    console.warn(
      "Klasické kliknutí selhalo, zkouším hard klik přes evaluate..."
    );
    await page.evaluate(() => {
      const button = document.querySelector("a.btn.btn-buy.flex-c");
      if (button) button.click();
    });
    console.log("Kliknutí na 'Koupit' proběhlo (hard click).");
  }

  //await page.goto("https://www.ticketportal.cz/cart");
  //   const pageContent = await page.content();

  //   if (pageContent.includes("Váš košík je prázdný")) {
  //     console.log("Chyba při přidání do košíku.");
  //   } else {
  //     console.log("Lístek je v košíku!");
  //   }
  //   await buyButton.click();

  await page.waitForFunction(() => window.location.href.includes("idp="), {
    timeout: 10000,
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.screenshot({ path: "side_with_seats.png", fullPage: true });
  await open("side_with_seats.png");
  console.log("jsem na stánce s mapou míst");
  // await browser.close();
  // Po kliku na Koupit počkej, až se objeví sedadla nebo ceník
  //await page.waitForSelector("#Sektor406", { visible: true, timeout: 10000 });

  //console.log("Načtena stránka s výběrem míst.");

  // Tady můžeš udělat logiku pro výběr místa
  // Příklad: klikni na první levné místo
  //   await page.waitForSelector(".bubble.bubble-sm", {
  //     visible: true,
  //     timeout: 10000,
  //   });

  //   await page.click('#Sektor112'); // nebo jiný sektor, který chceš
  //   console.log("Kliknuto na sektor.");

  // Po kliku na "Koupit" čekáme rovnou na sedadla
  // Po kliknutí na "Koupit" čekej na canvas
  await page.waitForSelector("#canvas", { visible: true });

  // Uděláme screenshot celého canvasu
  const canvas = await page.$("#canvas");
  await canvas.screenshot({ path: "canvas.png" });
  console.log("Načetla se mapa a udělal se screenshot");

  // Analyzujeme obrázek (Jimp)
  const image = await Jimp.read("canvas.png");

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  let freeSpots = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));

      if (isFreeSeatColor(r, g, b)) {
        freeSpots.push({ x, y });
      }
    }
  }

  function isFreeSeatColor(r, g, b) {
    return (
      (g > 150 && r < 100 && b < 100) || // Zelená
      (r > 150 && g < 100 && b < 100) || // Červená
      (b > 150 && r < 100 && g < 100) || // Modrá
      (r > 200 && g > 200 && b < 100) // Žlutá
    );
  }

  if (freeSpots.length === 0) {
    console.log("Žádná volná místa nenalezena!");
    await browser.close();
    return;
  }

  // Klikneme na první volné místo
  const { x, y } = freeSpots[0];
  const canvasBox = await canvas.boundingBox();
  const clickX = canvasBox.x + x;
  const clickY = canvasBox.y + y;

  await page.mouse.click(clickX, clickY);
  console.log(`Kliknuto na volné místo: ${x}, ${y}`);

  // Po kliknutí se ukáže bublina s detaily místa
  await page.waitForSelector("#rootPopisMiesta", { visible: true });

  // Potvrzení místa přes tlačítko "Pokračovat"
  const continueButton = await page.$(".hladisko-basket-btn.btn-success");
  if (continueButton) {
    await continueButton.click();
    console.log("Potvrzeno, sedadlo přidáno do košíku.");
  } else {
    throw new Error("Tlačítko 'Pokračovat' nebylo nalezeno!");
  }

  // Dál můžeš přidat přechod do košíku atd.

  //   await page.screenshot({ path: "after_sector.png", fullPage: true });
  //   await open("after_sector.png");

  //console.log("Přejito do košíku.");
}

runBot().catch(console.error);
