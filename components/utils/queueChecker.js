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
import { sleep } from "./sleep.js";

/**
 * Checks if the user is currently in a waiting queue
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<Object|null>} Queue information or null if not in queue
 */
export async function checkIfInQueue(page) {
  if (process.env.CONSOLE_LOGS === "true") {
    console.log("🔍 Kontroluji, zda jsem ve frontě...");
  }

  try {
    // Check for the waiting queue modal
    const queueModal = await page.$("#waiting-queue");
    if (!queueModal) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Nejsem ve frontě");
      }
      return null;
    }

    // Check if the modal is visible
    const isVisible = await page.evaluate((modal) => {
      const style = window.getComputedStyle(modal);
      return style.display !== "none" && style.visibility !== "hidden";
    }, queueModal);

    if (!isVisible) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Fronta není viditelná");
      }
      return null;
    }

    // Extract queue information
    const queueInfo = await page.evaluate(() => {
      const queueOrderElement = document.getElementById("queue-order");
      const queueOrder2Element = document.getElementById("queue-order-2");

      const queueOrder = queueOrderElement
        ? queueOrderElement.textContent.trim()
        : null;
      const queueOrder2 = queueOrder2Element
        ? queueOrder2Element.textContent.trim()
        : null;

      return {
        queueOrder: queueOrder,
        queueOrder2: queueOrder2,
        inQueue: true,
      };
    });

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(
        `🔄 Jsem ve frontě! Pořadí: ${
          queueInfo.queueOrder || queueInfo.queueOrder2
        }`
      );
    }

    return queueInfo;
  } catch (error) {
    console.error("❌ Chyba při kontrole fronty:", error.message);
    return null;
  }
}

/**
 * Waits for the queue to be resolved (modal disappears)
 * @param {Page} page - Puppeteer page object
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 300000 = 5 minutes)
 * @returns {Promise<boolean>} True if queue was resolved, false if timeout
 */
export async function waitForQueueResolution(page, timeout = 300000) {
  if (process.env.CONSOLE_LOGS === "true") {
    console.log("⏳ Čekám na vyřešení fronty...");
  }

  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Doba čekání ve frontě");
  }

  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds

  while (Date.now() - startTime < timeout) {
    const queueInfo = await checkIfInQueue(page);

    if (!queueInfo || !queueInfo.inQueue) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Fronta byla vyřešena!");
      }

      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Doba čekání ve frontě");
      }

      return true;
    }

    if (process.env.CONSOLE_LOGS === "true") {
      console.log(
        `⏳ Stále ve frontě... Pořadí: ${
          queueInfo.queueOrder || queueInfo.queueOrder2
        }`
      );
    }

    await sleep(checkInterval);
  }

  console.warn("⚠️ Timeout při čekání na vyřešení fronty");

  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Doba čekání ve frontě");
  }

  return false;
}

/**
 * Handles queue situation after a click action
 * @param {Page} page - Puppeteer page object
 * @param {Function} retryAction - Function to retry if queue is resolved
 * @returns {Promise<boolean>} True if action was successful, false otherwise
 */
export async function handleQueueAfterClick(page, retryAction) {
  const queueInfo = await checkIfInQueue(page);

  if (queueInfo && queueInfo.inQueue) {
    console.log(
      `🔄 Detekována fronta po kliknutí! Pořadí: ${
        queueInfo.queueOrder || queueInfo.queueOrder2
      }`
    );

    const queueResolved = await waitForQueueResolution(page);

    if (queueResolved && retryAction) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.log("🔄 Fronta vyřešena, opakuji akci...");
      }

      try {
        await retryAction(page);
        return true;
      } catch (error) {
        console.error(
          "❌ Chyba při opakování akce po vyřešení fronty:",
          error.message
        );
        return false;
      }
    }

    return queueResolved;
  }

  return true; // No queue detected, action was successful
}

export default {
  checkIfInQueue,
  waitForQueueResolution,
  handleQueueAfterClick,
};
