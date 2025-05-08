let alertMonitorRunning = false; // <-- globální proměnná v Puppeteer (ne ve stránce)

export async function setupAlertMonitor(page) {
  if (process.env.ALERT_MONITOR !== "true") return;

  if (alertMonitorRunning) return; // už běží, nespouštěj znovu
  alertMonitorRunning = true;

  if (process.env.CONSOLE_LOGS === "true") {
    console.log("🔴 Alert monitor je zapnutý.");
  }

  try {
    // exposeFunction volat jen 1× (jinak chyba)
    if (!page._alertExposed) {
      await page.exposeFunction("onAlertDetected", (alertText) => {
        console.log("🔴 Detekován alert:", alertText);
      });
      page._alertExposed = true;
    }

    await page.evaluate(() => {
      let lastAlert = null;
      const start = Date.now();

      const interval = setInterval(() => {
        if (Date.now() - start > 30000) {
          console.log("⏱️ Alert monitor skončil po 30s.");
          clearInterval(interval);
          return;
        }

        const alerts = Array.from(
          document.querySelectorAll(".alert.alert-danger")
        );
        for (const alert of alerts) {
          const isVisible =
            window.getComputedStyle(alert).display !== "none" &&
            alert.offsetParent !== null;

          if (isVisible) {
            const specific = alert.querySelector('span[data-notify="message"]');
            const text = (
              specific?.innerText ||
              alert.textContent.replace(/×/g, "").replace(/\s+/g, " ")
            ).trim();

            if (text && text !== lastAlert) {
              lastAlert = text;
              window.onAlertDetected(text);
            }

            console.log(`🔍 Detekován viditelný alert: ${text}`);
            return;
          }
        }

        console.log("🔍 Žádný viditelný alert nalezen.");
      }, 1000);
    });
  } catch (error) {
    if (!error.message.includes("already exists")) {
      throw error;
    }
  }
}
export default setupAlertMonitor;
