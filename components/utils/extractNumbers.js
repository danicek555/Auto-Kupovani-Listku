import { Jimp } from "jimp";
import Tesseract from "tesseract.js";

// Funkce pro OCR čísel z obrázku
export async function extractNumbersFromImage(pathToScreenshot) {
  // Načtení a předzpracování obrázku
  const image = await Jimp.read(pathToScreenshot);
  image
    .greyscale() // Odstraní barvy
    .contrast(1) // Zvýší kontrast
    .write("processed.png"); // Uloží upravený obrázek

  // Použití Tesseract.js na OCR
  const {
    data: { text },
  } = await Tesseract.recognize("processed.png", "eng");

  // Filtrujeme pouze čísla z rozpoznaného textu
  const numbers = text.match(/\d+/g) || [];

  console.log("Rozpoznaná čísla:", numbers);
  return numbers;
}

// Příklad použití
extractNumbersFromImage("4_canvas.png")
  .then((numbers) => console.log("Výstup OCR:", numbers))
  .catch((err) => console.error("Chyba při OCR:", err));
