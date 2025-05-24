import waitForCaptchaToFinish from "../utils/waitForCaptchaToFinish.js";

export async function acceptTerms(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Zaškrtnutí checkboxů");
  }

  await waitForCaptchaToFinish();

  try {
    const { totalCheckboxes, clickedCount } = await page.$$eval(
      '.terms-accept input[type="checkbox"]',
      (checkboxes) => {
        let count = 0;
        for (const cb of checkboxes) {
          if (!cb.checked) {
            cb.click();
            count++;
          }
        }
        return { totalCheckboxes: checkboxes.length, clickedCount: count };
      }
    );

    if (process.env.CONSOLE_LOGS === "true") {
      if (clickedCount > 0) {
        console.log(`✅ Zaškrtnuto ${clickedCount} checkboxů v acceptTerms.js`);
      } else if (totalCheckboxes > 0 && clickedCount === 0) {
        console.log(
          `✅ Všechny checkboxy (${totalCheckboxes}) už byly zaskrtnuté v acceptTerms.js`
        );
      } else {
        console.log("❌ Nebyly nalezeny žádné checkboxy v acceptTerms.js");
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

export default acceptTerms;
