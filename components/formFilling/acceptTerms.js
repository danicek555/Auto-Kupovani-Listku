import waitForCaptchaToFinish from "../utils/waitForCaptchaToFinish.js";
export async function acceptTerms(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Zaškrtnutí checkboxů");
  }
  await waitForCaptchaToFinish();

  try {
    const clickedCount = await page.$$eval(
      '.terms-accept input[type="checkbox"]',
      (checkboxes) => {
        let count = 0;
        for (const cb of checkboxes) {
          if (!cb.checked) {
            cb.click();
            count++;
          }
        }
        return count;
      }
    );
    if (process.env.CONSOLE_LOGS === "true") {
      if (clickedCount > 0) {
        console.log(`✅ Zaškrtnuto ${clickedCount} checkboxů v acceptTerms.js`);
      } else {
        console.log(
          "❌ Nepodařilo se zaškrtnout žádný checkbox v acceptTerms.js"
        );
      }
    }
  } catch (error) {
    console.warn(
      "❌ Nepodařilo se zaškrtnout checkboxy v acceptTerms.js:",
      error.message
    );
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Zaškrtnutí checkboxů");
  }
}
