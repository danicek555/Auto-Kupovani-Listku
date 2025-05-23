import waitForCaptchaToFinish from "../utils/waitForCaptchaToFinish.js";
export async function choosePayment(page) {
  const selector = "#template_payOption_17";
  const timeout = 5000;
  const pollInterval = 50;
  await waitForCaptchaToFinish();

  const waitForAndClick = async () => {
    while (true) {
      try {
        const element = await page.$(selector);
        if (element) {
          await page.click(selector);
          if (process.env.CONSOLE_LOGS === "true") {
            console.log(
              "✅ Zvolena platba kartou / Google Pay / Apple Pay v choosePayment.js"
            );
          }
          return true;
        }
      } catch (e) {
        const msg = e.message;
        if (msg.includes("Execution context was destroyed")) {
          console.warn(
            "❌ Přesměrování při výběru platby v choosePayment.js. Zkouším znovu..."
          );
        } else {
          console.warn("❌ Chyba při výběru platby v choosePayment.js:", msg);
        }
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }
  };

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), timeout)
  );

  try {
    if (process.env.EXECUTION_TIME === "true") {
      console.time("⏱️ Doba pollingu 'Zvolit platbu'");
    }
    await Promise.race([waitForAndClick(), timeoutPromise]);
    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Doba pollingu 'Zvolit platbu'");
    }
  } catch (error) {
    console.warn(
      "❌ Nepodařilo se zvolit platbu v choosePayment.js:",
      error.message
    );
  }
}
export default choosePayment;
