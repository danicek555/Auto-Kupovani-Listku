// Copyright 2025 Daniel Mitka
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
async function getRecaptchaSitekey(page) {
  const frames = page.frames();
  for (const frame of frames) {
    const url = frame.url();
    if (url.includes("https://www.google.com/recaptcha/api2/anchor")) {
      const sitekey = new URL(url).searchParams.get("k");
      if (sitekey) {
        console.log("✅ Nalezený sitekey:", sitekey);
        return sitekey;
      }
    }
  }

  throw new Error("❌ Nepodařilo se najít reCAPTCHA iframe nebo sitekey.");
}

export default getRecaptchaSitekey;
