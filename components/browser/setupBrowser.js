// import puppeteer from "puppeteer";

// export async function setupBrowser(url) {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
//   );

//   await page.goto(url, { waitUntil: "networkidle2" });

//   await page.setViewport({
//     width: 1920,
//     height: 1080,
//     deviceScaleFactor: 1,
//   });

//   await page.evaluate(() => {
//     document.body.style.transform = "scale(1)";
//     document.body.style.transformOrigin = "top left";
//   });

//   await page.screenshot({
//     path: "./public/screenshots/0_site.png",
//     fullPage: true,
//   });

//   return { browser, page };
// }
import puppeteer from "puppeteer";
import fs from "fs-extra";
import setupAlertMonitor from "../utils/setupAlertMonitor.js";
import { sleep } from "../utils/sleep.js";

export async function setupBrowser(url) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Celkový čas setupu");
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Spuštění prohlížeče");
  }
  const browser = await puppeteer.launch({
    headless: process.env.BROWSER_HEADLESS === "true" ? false : true, // změň na false pokud chceš okno, pokud bez na "new" nebo na True, ale lepší je na "new" - tedka mi to treba nejde
    defaultViewport: null,
    //userDataDir: "./tmp", // ukládání cookie do tmp
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-sync",
      "--disable-translate",
      "--metrics-recording-only",
      "--mute-audio",
      "--single-process",
    ],
  });
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Spuštění prohlížeče");
  }

  const page = await browser.newPage();
  if (process.env.ALERT_MONITOR === "true") {
    // Zachytávej alerty z konzole
    page.on("console", async (msg) => {
      const text = msg.text();
      if (text.startsWith("⚠️⚠️⚠️[ALERT]")) {
        console.log(text);
      } else {
        if (process.env.BROWSER_CONSOLE_LOGS === "true") {
          console.log("🧠 Browser console log: ", text);
        }
      }
    });
  }
  if (process.env.CONSOLE_LOGS === "true") {
    page.on("console", async (msg) => {
      const text = msg.text();
      if (text.startsWith("C")) {
        console.log(text);
      } else {
        if (process.env.BROWSER_CONSOLE_LOGS === "true") {
          console.log("🧠 Browser console log 2: " + text);
        }
      }
    });
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Nastavení blokace zdrojů");
  }
  if (process.env.STYLY === "false") {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resource = req.resourceType();
      if (
        ["image", "stylesheet", "font", "media", "other"].includes(resource)
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Nastavení blokace zdrojů");
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Nastavení user agentu");
  }
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Nastavení user agentu");
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Načtení stránky");
  }
  if (process.env.ALERT_MONITOR === "true") {
    page.on("framenavigated", async () => {
      try {
        await setupAlertMonitor(page);
      } catch (err) {
        console.error(
          "❌ Stránka se možná ještě nenačetla v setupBrowser.js v kodu pro alert monitor",
          err.message
        );
      }
    });
  }

  await page
    .goto(url, { waitUntil: "domcontentloaded", timeout: 10000 })
    .catch((err) =>
      console.error("❌ Timeout nebo jiná chyba v setupBrowser.js", err.message)
    );

  if (process.env.ALERT_MONITOR === "true") {
    await setupAlertMonitor(page);
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Načtení stránky");
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Nastavení viewportu");
  }
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Nastavení viewportu");
  }

  if (process.env.SCREENSHOTS === "true") {
    await page.screenshot({
      path: "./public/screenshots/0_site.png",
      fullPage: false,
    });
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Celkový čas setupu");
  }

  return { browser, page };
}

//TODO: že by google chrome by lpořád zapnutý a ty by jsi jen otevíral stránky a pracoval s nimi??
