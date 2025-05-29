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
async function setupAlertMonitor(page) {
  await page.evaluate(() => {
    if (window.__alertMonitorIntervalId) {
      clearInterval(window.__alertMonitorIntervalId);
    }

    window.__alertMonitorIntervalId = setInterval(() => {
      let foundAlert = false;

      // 1. Hledej notifikační alerty (data-notify)
      const notifyAlerts = Array.from(
        document.querySelectorAll('[data-notify="container"]')
      );
      for (const el of notifyAlerts) {
        const style = window.getComputedStyle(el);
        const visible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0";
        const message = el
          .querySelector('[data-notify="message"]')
          ?.textContent?.trim();

        if (visible && message) {
          console.log(`⚠️⚠️⚠️[ALERT] Detekován notify alert: "${message}"`);
          foundAlert = true;
          break;
        }
      }

      // 2. Hledej standardní Bootstrap-like alerty
      const standardAlerts = Array.from(
        document.querySelectorAll("div.alert.alert-danger")
      );
      for (const el of standardAlerts) {
        const style = window.getComputedStyle(el);
        const visible =
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0";
        const message = el.textContent?.trim();

        if (visible && message) {
          console.log(`⚠️⚠️⚠️[ALERT] Detekován standardní alert: "${message}"`);
          foundAlert = true;
          break;
        }
      }
    }, 250); // rychlejší kontrola
  });
}

export default setupAlertMonitor;
