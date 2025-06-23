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

import dotenv from "dotenv";
import { setupBrowser } from "./components/browser/setupBrowser.js";
import { clickBuyButton } from "./components/action/clickBuyButton.js";
import setupAlertMonitor from "./components/utils/setupAlertMonitor.js";
import formFilling from "./components/formFilling/formFilling.js";
import clickBasketAndSelectSeats from "./components/utils/clickBasketAndSelectSeats.js";
import alertChecker from "./components/utils/alertChecker.js";

import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  checkIfInQueue,
  waitForQueueResolution,
} from "./components/utils/queueChecker.js";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const envFilePath = path.join(__dirname, ".env");
const TICKET_URL = process.env.TICKET_URL;

if (!existsSync(envFilePath)) {
  console.log("Soubor .env neexistuje!!!");
  process.exit(1);
}

if (!TICKET_URL) {
  console.log("Nezadal jsi URL do .env!!!");
  process.exit(1);
}

async function runBot() {
  console.time("🔁 Doba spuštění botu");
  const { browser, page } = await setupBrowser(TICKET_URL); //* optimalizace done

  if (process.env.ALERT_MONITOR === "true") {
    if (process.env.EXECUTION_TIME === "true") {
      console.time("⏱️ Zapnutí alert monitoru");
    }
    await setupAlertMonitor(page);
    alertChecker(page);
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Zapnutí alert monitoru");
    }
  }

  await clickBuyButton(page);

  //await clickBasketAndSelectSeats(page);

  // Simple queue check
  const queueInfo = await checkIfInQueue(page);
  if (queueInfo) {
    console.log(`In queue at position: ${queueInfo.queueOrder}`);
  }

  // Wait for queue resolution
  await waitForQueueResolution(page, 2400000); // 10 minutes 600 000 - 20minutes 1 200 000, 30 minutes 240000
  if (process.env.ONLY_CLICK === "false") {
    await clickBasketAndSelectSeats(page);
    const success = await formFilling(page);
    // Handle queue after click with retry
    //const success = await handleQueueAfterClick(page, async (page) => {
    //  // Your retry action here
    //  await clickBasketAndSelectSeats(page);
    //});

    if (success) {
      const pocetListku = process.env.TICKET_COUNT;
      let sklonovaniSlovicka = "listků";
      if (pocetListku === 1) {
        sklonovaniSlovicka = "lístek";
      } else if (pocetListku > 1 && pocetListku < 5) {
        sklonovaniSlovicka = "listky";
      } else {
        sklonovaniSlovicka = "listků";
      }
      console.log("🎉 Bot nakoupil " + pocetListku + " " + sklonovaniSlovicka);

      console.timeEnd("🔁 Doba spuštění botu");
    }
  }
  if (process.env.ONLY_CLICK === "true") {
    console.log("Bot kliknul a prošel frontou");
  }
}

runBot().catch(console.error);
