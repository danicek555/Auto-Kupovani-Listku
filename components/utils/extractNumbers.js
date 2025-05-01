import fs from "fs";
import { Jimp } from "jimp";
import Tesseract from "tesseract.js";

export async function extractNumbersFromImage(imagePath) {
  if (!fs.existsSync(imagePath))
    return console.error("Chyba: Obrázek neexistuje!");

  try {
    const image = await Jimp.read(imagePath);
    await image.write("processed.png");

    const result = await Tesseract.recognize("processed.png", "eng", {
      tessedit_char_whitelist: "0123456789",
      oem: 1,
    });

    const numbers = result.data.text.match(/\d+/g) || [];
    //console.log("Rozpoznaná čísla:", numbers);
    return numbers;
  } catch (error) {
    console.error("Chyba při OCR:", error);
    return [];
  }
}
