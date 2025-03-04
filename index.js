import puppeteer from "puppeteer";
import { solveCaptcha } from "./captchaSolver.js"; // mock solver
import dotenv from "dotenv";
import open from "open";
import { Jimp } from "jimp";
import { intToRGBA } from "@jimp/utils";
import { rgbaToInt } from "@jimp/utils";

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
  //await page.screenshot({ path: "before_cookies.png", fullPage: true });

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

  await page.screenshot({ path: "1_after_cookies.png", fullPage: true });
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

    await page.screenshot({ path: "2_after_captcha.png", fullPage: true });
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
  console.log("Čekám/Hledám na tlačítko 'Koupit'...");
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
  await page.screenshot({ path: "3_site_with_seats.png", fullPage: true });
  //await open("3_site_with_seats.png");
  console.log("Jsem na stánce s mapou míst");
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
  await canvas.screenshot({ path: "4_canvas.png" });
  console.log("Načetla se mapa a udělal se screenshot");

  const image = await Jimp.read("4_canvas.png");
  // Normalizace barev (body 4)
  image.contrast(0.3); // Zvýší kontrast

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  let clusters = [];
  let visited = new Set();

  function isFreeSeatColor(r, g, b) {
    const greenDominates = g > r + 15 && g > b + 15 && g > 50;
    const redDominates = r > g + 15 && r > b + 15 && r > 50;
    const blueDominates = b > r + 15 && b > g + 15 && b > 50;
    const yellowDominates = r > 200 && g > 200 && b < 100;

    return greenDominates || redDominates || blueDominates || yellowDominates;
  }

  // Hledání shluků barevných bodů (body 3 + 5)
  function floodFill(x, y, cluster) {
    const stack = [{ x, y }];
    while (stack.length > 0) {
      const { x, y } = stack.pop();
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      const color = image.getPixelColor(x, y);
      const { r, g, b } = intToRGBA(color);
      if (!isFreeSeatColor(r, g, b)) continue;

      visited.add(key);
      cluster.push({ x, y });

      stack.push({ x: x + 1, y }); // Doplněno
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited.has(`${x},${y}`)) continue;
      const color = image.getPixelColor(x, y);
      const { r, g, b } = intToRGBA(color);
      if (isFreeSeatColor(r, g, b)) {
        let cluster = [];
        floodFill(x, y, cluster);
        if (cluster.length >= 10) {
          // Minimální velikost shluku
          clusters.push(cluster);
        }
      }
    }
  }

  if (clusters.length === 0) {
    console.log("Žádná volná místa nenalezena!");
    return;
  }

  // Najdeme střed prvního shluku (body 5)
  const firstCluster = clusters[0];
  const avgX = Math.round(
    firstCluster.reduce((sum, p) => sum + p.x, 0) / firstCluster.length
  );
  const avgY = Math.round(
    firstCluster.reduce((sum, p) => sum + p.y, 0) / firstCluster.length
  );

  const canvasBox = await canvas.boundingBox();
  const clickX = canvasBox.x + avgX;
  const clickY = canvasBox.y + avgY;
  console.log(`Klikám na absolutní souřadnice: ${clickX}, ${clickY}`);

  await page.screenshot({ path: "before_click.png" });

  await page.mouse.click(clickX, clickY);

  await page.screenshot({ path: "after_click.png" });

  await page.screenshot({ path: "5_seat_selected.png", fullPage: true });
  //await open("5_seat_selected.png");
  // Debug: vykreslit do obrázku shluky a uložit
  // Debug: vykreslit do obrázku shluky a uložit
  for (const cluster of clusters) {
    for (const { x, y } of cluster) {
      image.setPixelColor(rgbaToInt(0, 0, 255, 255), x, y); // Modrá značí nalezené místo
    }
  }

  // Přidání černé tečky do středu prvního shluku (kde jsme klikli)
  function drawDot(image, x, y, size = 7) {
    const color = rgbaToInt(255, 0, 0, 255); // Červená

    for (let dx = -Math.floor(size / 2); dx <= Math.floor(size / 2); dx++) {
      for (let dy = -Math.floor(size / 2); dy <= Math.floor(size / 2); dy++) {
        const px = x + dx;
        const py = y + dy;

        if (
          px >= 0 &&
          py >= 0 &&
          px < image.bitmap.width &&
          py < image.bitmap.height
        ) {
          image.setPixelColor(color, px, py);
        }
      }
    }
  }

  // Vykreslíme černou tečku přímo do toho debug obrázku
  drawDot(image, avgX, avgY, 7);

  await image.write("6_blue_free_spots.png");
  console.log("Debug obrázek uložen jako 6_blue_free_spots.png");

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
