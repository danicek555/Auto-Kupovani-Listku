// export async function confirmEmailModal(page) {
//   if (process.env.EXECUTION_TIME === "true") {
//     console.time("⏱️ Klikání na tlačítko 'Ano, potvrdit'");
//   }

//   try {
//     const maxTime = 10000;
//     const interval = 50;
//     const start = Date.now();

//     let urlReady = false;
//     console.log(
//       "🔁 Čekám na URL s 'Basket#modalEmailOK' v confirmEmailModal.js"
//     );
//     while (Date.now() - start < maxTime) {
//       if (page.isClosed()) {
//         throw new Error(
//           "Stránka byla zavřena během čekání na URL v confirmEmailModal.js"
//         );
//       }
//       let currentUrl;
//       try {
//         currentUrl = page.url();
//       } catch (err) {
//         console.warn(
//           "⚠️ Nepodařilo se získat URL – možná navigace:",
//           err.message
//         );
//         break;
//       }
//       if (currentUrl.includes("Basket#modalEmailOK")) {
//         urlReady = true;
//         break;
//       }
//       await new Promise((res) => setTimeout(res, interval));
//     }

//     if (!urlReady) {
//       throw new Error(
//         "URL s 'Basket#modalEmailOK' se neobjevila včas v confirmEmailModal.js"
//       );
//     }

//     if (process.env.CONSOLE_LOGS === "true") {
//       console.log(
//         "✅ Stránka s potvrzením emailu načtena v confirmEmailModal.js"
//       );
//     }

//     // Pooling na tlačítko
//     let clicked = false;
//     const buttonStart = Date.now();

//     while (Date.now() - buttonStart < maxTime) {
//       if (page.isClosed()) {
//         throw new Error(
//           "Stránka byla zavřena během pollingu tlačítka v confirmEmailModal.js"
//         );
//       }

//       try {
//         clicked = await page.evaluate(() => {
//           const btn = document.querySelector("#quick-buy-btn-confirm-confirm");
//           if (!btn) return false;
//           btn.click();
//           return true;
//         });
//       } catch (err) {
//         console.warn(
//           "⚠️ Kontext byl zničen při pollingu tlačítka:",
//           err.message
//         );
//         break;
//       }

//       if (clicked) break;
//       await new Promise((res) => setTimeout(res, interval));
//     }

//     if (clicked) {
//       if (process.env.CONSOLE_LOGS === "true") {
//         console.log("✅ Kliknuto na 'Ano, potvrdit' v confirmEmailModal.js");
//       }
//     } else {
//       throw new Error(
//         "Tlačítko 'Ano, potvrdit' nebylo nalezeno nebo se nepodařilo kliknout v confirmEmailModal.js"
//       );
//     }

//     // Screenshot (volitelný)
//     if (process.env.SCREENSHOTS === "true") {
//       if (process.env.EXECUTION_TIME === "true") {
//         console.time(
//           "⏱️ Vytvoření screenshotu 6_Stranka s potvrzenim emailu.png v confirmEmailModal.js"
//         );
//       }
//       try {
//         await page.screenshot({
//           path: "./public/screenshots/6_Stranka s potvrzenim emailu.png",
//           fullPage: true,
//         });
//       } catch (err) {
//         if (process.env.CONSOLE_LOGS === "true") {
//           console.error(
//             "❌ Screenshot selhal v confirmEmailModal.js:",
//             err.message
//           );
//         }
//       }
//       if (process.env.EXECUTION_TIME === "true") {
//         console.timeEnd(
//           "⏱️ Vytvoření screenshotu 6_Stranka s potvrzenim emailu.png v confirmEmailModal.js"
//         );
//       }
//     }

//     if (process.env.EXECUTION_TIME === "true") {
//       console.timeEnd("⏱️ Klikání na tlačítko 'Ano, potvrdit'");
//     }

//     return true;
//   } catch (err) {
//     console.error("❌ Chyba v confirmEmailModal.js:", err.message);
//     return false;
//   }
// }

// export default confirmEmailModal;
export async function confirmEmailModal(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Klikání na tlačítko 'Ano, potvrdit'");
  }

  try {
    console.log("🔁 Čekám na tlačítko 'Ano, potvrdit' v confirmEmailModal.js");
    await page.waitForSelector("#quick-buy-btn-confirm-confirm", {
      timeout: 10000,
    });

    await page.click("#quick-buy-btn-confirm-confirm");

    if (process.env.CONSOLE_LOGS === "true") {
      console.log("✅ Kliknuto na 'Ano, potvrdit' v confirmEmailModal.js");
    }

    if (process.env.SCREENSHOTS === "true") {
      if (process.env.EXECUTION_TIME === "true") {
        console.time(
          "⏱️ Vytvoření screenshotu 6_Stranka s potvrzenim emailu.png v confirmEmailModal.js"
        );
      }
      try {
        await page.screenshot({
          path: "./public/screenshots/6_Stranka s potvrzenim emailu.png",
          fullPage: true,
        });
      } catch (err) {
        console.error(
          "❌ Screenshot selhal v confirmEmailModal.js:",
          err.message
        );
      }
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd(
          "⏱️ Vytvoření screenshotu 6_Stranka s potvrzenim emailu.png v confirmEmailModal.js"
        );
      }
    }

    if (process.env.EXECUTION_TIME === "true") {
      console.timeEnd("⏱️ Klikání na tlačítko 'Ano, potvrdit'");
    }

    return true;
  } catch (err) {
    console.error("❌ Chyba v confirmEmailModal.js:", err.message);
    return false;
  }
}

export default confirmEmailModal;
