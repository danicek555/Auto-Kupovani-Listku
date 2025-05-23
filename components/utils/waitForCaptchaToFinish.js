export async function waitForCaptchaToFinish() {
  if (!global.captchaActive) return;

  console.log("🛑 Čekám na vyřešení reCAPTCHA...");
  await new Promise((resolve) => {
    const check = setInterval(() => {
      if (!global.captchaActive) {
        clearInterval(check);
        resolve();
      }
    }, 1000);
  });
}
export default waitForCaptchaToFinish;
