export async function acceptTerms(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Zaškrtnutí checkboxů");
  }
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
      console.log(`✅ Zaškrtnuto ${clickedCount} checkboxů.`);
    }
  } catch (error) {
    console.warn("❌ Nepodařilo se zaškrtnout checkboxy:", error.message);
  }
  if (process.env.EXECUTION_TIME === "true") {
    console.timeEnd("⏱️ Zaškrtnutí checkboxů");
  }
}
