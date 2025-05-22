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

import fs from "fs-extra";
import setupAlertMonitor from "../utils/setupAlertMonitor.js";
import { sleep } from "../utils/sleep.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
//import puppeteer from "puppeteer";
import getRecaptchaSitekey from "../utils/getRecaptchaSiteKey.js";
import solveRecaptcha from "../utils/solveRecaptcha.js";
import { startRecaptchaWatcher } from "../utils/recaptchaWatcher.js";
//import { sleep } from "../utils/sleep.js";

export async function setupBrowser(url) {
  puppeteer.use(StealthPlugin());
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
      "--disable-gpu",
      "--disable-features=IsolateOrigins,site-per-process",
      "--window-size=1920,1080",
    ],
  });
  // "--no-sandbox",
  // "--disable-setuid-sandbox",
  // "--disable-dev-shm-usage",
  // "--disable-accelerated-2d-canvas",
  // "--no-first-run",
  // "--no-zygote",
  // "--disable-gpu",
  // "--disable-background-networking",
  // "--disable-default-apps",
  // "--disable-extensions",
  // "--disable-sync",
  // "--disable-translate",
  // "--metrics-recording-only",
  // "--mute-audio",
  // "--single-process",
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Spuštění prohlížeče");
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Zapnutí browser console logů");
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
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Zapnutí browser console logů");
  }
  // if (process.env.CONSOLE_LOGS === "true") {
  //   page.on("console", async (msg) => {
  //     const text = msg.text();
  //     if (text.startsWith("C")) {
  //       console.log(text);
  //     } else {
  //       if (process.env.BROWSER_CONSOLE_LOGS === "true") {
  //         console.log("🧠 Browser console log 2: " + text);
  //       }
  //     }
  //   });
  // }

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
    .goto(url, { waitUntil: "load", timeout: 200000 }) //domcontentloaded
    .catch((err) =>
      console.error("❌ Timeout nebo jiná chyba v setupBrowser.js", err.message)
    );
  //wait page.waitForTimeout(1000); // malá pauza před další emulací
  // Získání všech iframe
  await sleep(2000); // počkej 2s na stabilizaci DOMu
  page.on("close", () => {
    console.warn("⚠️ Stránka byla zavřena (page.close event)");
  });
  page.on("error", (err) => {
    console.error("❌ Chyba stránky:", err.message);
  });

  let scripts = [];
  try {
    scripts = await page.$$eval("script[src]", (scripts) =>
      scripts.map((s) => s.src)
    );
    console.log("Script sources:", scripts);
  } catch (err) {
    console.error("❌ Chyba při čtení script[src]:", err.message);
  }
  console.log("Script sources:", scripts);
  page.on("framenavigated", (frame) => {
    console.log("🔁 Navigace – frame URL:", frame.url());
  });

  if (process.env.RECAPTCHA === "true") {
    console.log("jsem pred captchou");
    // 1. Získej sitekey automaticky
    // console.log("čekám na reCAPTCHA element...");
    // await page.waitForSelector(".g-recaptcha", { timeout: 10000 });
    // console.log("Div s reCAPTCHA je přítomen.");

    await startRecaptchaWatcher(page, url);
    // // počkej na reCAPTCHA iframe
  }
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
    if (process.env.EXECUTION_TIME === "true") {
      console.time("⏱️ Vytvoření screenshotu 0_site.png v setupBrowser.js");
    }
    await page.screenshot({
      path: "./public/screenshots/0_site.png",
      fullPage: false,
    });
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Vytvoření screenshotu 0_site.png v setupBrowser.js");
    }
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Celkový čas setupu");
  }

  console.log("zapl jsem se ");
  return { browser, page };
}

//TODO: že by google chrome by lpořád zapnutý a ty by jsi jen otevíral stránky a pracoval s nimi??
