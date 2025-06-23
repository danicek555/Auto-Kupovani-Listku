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
    // Check if the modal is actually active and displayed with queue information
    const queueInfo = await page.evaluate(() => {
      const modal = document.getElementById("waiting-queue");

      if (!modal) {
        return null;
      }

      // Check if modal is visible and active
      const style = window.getComputedStyle(modal);
      const isVisible =
        style.display !== "none" && style.visibility !== "hidden";

      // Check if modal is not hidden by aria-hidden attribute
      const isNotHidden = modal.getAttribute("aria-hidden") !== "true";

      // Check for Bootstrap modal classes that indicate it's active
      const hasActiveClass =
        modal.classList.contains("in") || modal.classList.contains("show");

      // Check if modal backdrop exists (Bootstrap creates this when modal is active)
      const backdrop = document.querySelector(".modal-backdrop");
      const hasBackdrop = backdrop && backdrop.style.display !== "none";

      // Check if body has modal-open class (Bootstrap adds this when modal is active)
      const bodyHasModalOpen = document.body.classList.contains("modal-open");

      // Additional check: modal should be positioned properly (not off-screen)
      const rect = modal.getBoundingClientRect();
      const isPositioned = rect.width > 0 && rect.height > 0 && rect.top >= 0;

      // Most important: check if there are actual queue numbers
      const queueOrderElement = document.getElementById("queue-order");
      const queueOrder2Element = document.getElementById("queue-order-2");

      const queueOrder = queueOrderElement
        ? queueOrderElement.textContent.trim()
        : "";
      const queueOrder2 = queueOrder2Element
        ? queueOrder2Element.textContent.trim()
        : "";

      // Check if queue numbers actually contain meaningful data (not empty)
      const hasQueueNumbers = queueOrder.length > 0 || queueOrder2.length > 0;

      // Check if the modal is actually displayed (has display: block style)
      const hasDisplayBlock =
        style.display === "block" || modal.style.display === "block";

      // All conditions must be met for the user to be in queue
      const isInQueue =
        isVisible &&
        isNotHidden &&
        hasDisplayBlock &&
        (hasActiveClass || hasBackdrop || bodyHasModalOpen) &&
        isPositioned &&
        hasQueueNumbers;

      if (!isInQueue) {
        return null;
      }

      return {
        queueOrder: queueOrder || null,
        queueOrder2: queueOrder2 || null,
        inQueue: true,
      };
    });

    if (!queueInfo) {
      if (process.env.CONSOLE_LOGS === "true") {
        console.log("✅ Nejsem ve frontě");
      }
      return null;
    }

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

export default {
  checkIfInQueue,
  waitForQueueResolution,
};
