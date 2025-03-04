import puppeteer from "puppeteer";
import { solveCaptcha } from "./captchaSolver.js"; // mock solver
import dotenv from "dotenv";
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
  // Čekáme na načtení canvasu
  await page.waitForSelector("#canvas", { visible: true });
  const canvas = await page.$("#canvas");

  // Screenshot canvasu
  await canvas.screenshot({ path: "4_canvas.png" });
  console.log("Načetla se mapa a udělal se screenshot");

  // Načteme do Jimp
  const image = await Jimp.read("4_canvas.png");

  // Zvýšíme kontrast (klidně si uprav podle testování)
  image.contrast(0.3);

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  let clusters = [];
  let visited = new Set();

  // Detekce barev sedadel (tolerantní)
  function isFreeSeatColor(r, g, b) {
    const greenDominates = g > r + 15 && g > b + 15 && g > 50;
    const redDominates = r > g + 15 && r > b + 15 && r > 50;
    const blueDominates = b > r + 15 && b > g + 15 && b > 50;
    const yellowDominates = r > 200 && g > 200 && b < 100;

    return greenDominates || redDominates || blueDominates || yellowDominates;
  }

  // Flood fill algoritmus pro hledání shluků
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

      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
  }

  // Najdeme všechny shluky
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

  // Funkce pro kliknutí na střed shluku + černá tečka
  async function clickOnCluster(page, canvas, cluster, image) {
    const avgX = Math.round(
      cluster.reduce((sum, p) => sum + p.x, 0) / cluster.length
    );
    const avgY = Math.round(
      cluster.reduce((sum, p) => sum + p.y, 0) / cluster.length
    );

    const canvasBox = await canvas.boundingBox();
    const clickX = canvasBox.x + avgX;
    const clickY = canvasBox.y + avgY;
    console.log(`Klikám na absolutní souřadnice: ${clickX}, ${clickY}`);

    await page.screenshot({
      path: `before_click_${clickX}_${clickY}.png`,
      fullPage: true,
    });

    await page.mouse.click(clickX, clickY);

    await new Promise((resolve) => setTimeout(resolve, 100));
    await page.screenshot({
      path: `after_click_${clickX}_${clickY}.png`,
      fullPage: true,
    });

    // Přidáme černou tečku do debug obrázku
    drawDot(image, avgX, avgY, 7, { r: 0, g: 0, b: 0 }); // černá tečka
  }

  // Funkce pro vykreslení tečky
  function drawDot(image, x, y, size = 7, color = { r: 255, g: 0, b: 0 }) {
    const dotColor = rgbaToInt(color.r, color.g, color.b, 255);

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
          image.setPixelColor(dotColor, px, py);
        }
      }
    }
  }

  // Vybarvíme všechny nalezené clustery modře
  for (const cluster of clusters) {
    for (const { x, y } of cluster) {
      image.setPixelColor(rgbaToInt(0, 0, 255, 255), x, y); // Modrá
    }
  }

  // Klikneme na první 4 volné shluky (sedačky vedle sebe)
  for (let i = 0; i < Math.min(4, clusters.length); i++) {
    await clickOnCluster(page, canvas, clusters[i], image);
  }

  // Uložíme finální obrázek s modrými shluky + černými tečkami na kliknutých místech
  await image.write("5_blue_free_spots.png");
  console.log("Debug obrázek uložen jako 5_blue_free_spots.png");

  await page.waitForSelector("#hladisko-basket-btn", { visible: true });
  await page.click("#hladisko-basket-btn");
  console.log("Kliknuto na tlačítko 'Pokračovat do košíku'.");

  //STRANKA NA ZAPLACENI
  await page.waitForFunction(() => window.location.href.includes("Basket"));
  console.log("Stránka 'Basket' načtena.");

  await page.screenshot({ path: "6_Jsem na strance na zaplacení.png" });

  await page.waitForSelector("#optionsRadiosPoistenie2", { visible: true });
  await page.click("#optionsRadiosPoistenie2");
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
  await page.click('label[for="pickupTypeOption"]');
  console.log("Kliknuto na label pro eTicket.");

  // await page.waitForSelector("#pickupTypeOptionContainer_7", { visible: true });

  await page.waitForSelector("#email_pickup_7", { visible: true });
  await page.type("#email_pickup_7", "listecky007@gmail.com");
  console.log("Vyplněn email: danmitka@gmail.com");

  await page.waitForSelector('input[name="ht_separe"]', { visible: true });
  await page.click('input[name="ht_separe"]');
  console.log("Zaškrtnuto: Zaslat každou vstupenku jako samostatnou přílohu.");

  await page.waitForSelector("#template_payOption_17", { visible: true });
  await page.click("#template_payOption_17");
  console.log("Zvolena platba kartou / Google Pay / Apple Pay.");

  await page.waitForSelector("#termsAccept_TicketportalTermsAccept", {
    visible: true,
  });
  await page.click("#termsAccept_TicketportalTermsAccept");
  console.log(
    "Zaškrtnuto: Souhlasím s VŠEOBECNÉ A OBCHODNÍ PODMÍNKY A REKLAMAČNÍ ŘÁD."
  );

  await page.screenshot({
    path: "7_Vyplnena stranka na zaplaceni.png",
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
