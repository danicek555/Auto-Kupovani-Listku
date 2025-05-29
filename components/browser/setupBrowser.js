// Copyright 2025 Daniel Mitka
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import setupAlertMonitor from "../utils/setupAlertMonitor.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { startRecaptchaWatcher } from "../captcha/recaptchaWatcher.js";

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

  page.on("close", () => {
    console.warn("⚠️ Stránka byla zavřena (page.close event)");
  });
  page.on("error", (err) => {
    console.error("❌ Chyba stránky:", err.message);
  });
  if (process.env.BROWSER_SCRIPTS === "true") {
    let scripts = [];
    try {
      scripts = await page.$$eval("script[src]", (scripts) =>
        scripts.map((s) => s.src)
      );
      console.log("Script sources:", scripts);
    } catch (err) {
      console.error("❌ Chyba při čtení script[src]:", err.message);
    }
  }
  // console.log("Script sources:", scripts);
  if (process.env.RECAPTCHA === "true") {
    global.captchaActive = false;

    page.on("framenavigated", async (frame) => {
      if (
        frame.url().includes("recaptcha/api2/anchor") &&
        !global.captchaActive
      ) {
        global.captchaActive = true;
        console.log("🧩 Znovu detekována reCAPTCHA! Spouštím řešení...");

        try {
          await startRecaptchaWatcher(page, page.url());

          // Čekej, než bude token vložený
          await page.waitForFunction(
            () => {
              const el = document.getElementById("g-recaptcha-response");
              return el && el.value && el.value.length > 0;
            },
            { timeout: 60000 }
          );

          console.log("✅ CAPTCHA vyřešena. Pokračuji.");
        } catch (err) {
          console.error("❌ Chyba při řešení CAPTCHA:", err.message);
        } finally {
          global.captchaActive = false;
        }
      }
    });
  }
  if (process.env.RECAPTCHA === "true") {
    console.log("jsem pred captchou");
    await startRecaptchaWatcher(page, page.url());

    await page.waitForFunction(
      () => {
        const el = document.getElementById("g-recaptcha-response");
        return el && el.value && el.value.length > 0;
      },
      { timeout: 60000 }
    );

    console.log("✅ CAPTCHA před startem vyřešena.");
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
