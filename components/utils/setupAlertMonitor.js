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
          console.log(`[ALERT] Detekován notify alert: "${message}"`);
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

      if (!foundAlert) {
        console.log("[ALERT] Žádný alert nebyl detekován.");
      }
    }, 250); // rychlejší kontrola
  });
}

export default setupAlertMonitor;
