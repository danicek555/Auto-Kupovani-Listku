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

import { sleep } from "../utils/sleep.js";

/**
 * Checks if the ticket selection modal is actually active and displayed
 * @param {Page} page - Puppeteer page object
 * @returns {Promise<boolean>} True if modal is active, false otherwise
 */
export async function checkIfTicketModalActive(page) {
  if (process.env.CONSOLE_LOGS === "true") {
    console.log("🔍 Kontroluji, zda je modal pro výběr vstupenek aktivní...");
  }

  try {
    const modalInfo = await page.evaluate(() => {
      // Check for the ticket selection modal
      const modal = document.getElementById("modalVyberPocetMiest20");

      if (!modal) {
        return { isActive: false, reason: "Modal element not found" };
      }

      // Check if modal is visible and active
      const style = window.getComputedStyle(modal);
      const isVisible =
        style.display !== "none" && style.visibility !== "hidden";

      // Check if modal is not hidden by aria-hidden attribute (if it exists)
      const ariaHidden = modal.getAttribute("aria-hidden");
      // Don't rely on aria-hidden as it's often not properly updated by Bootstrap
      // const isNotHidden = ariaHidden !== "true";
      const isNotHidden = true; // Always consider this true since other indicators are more reliable

      // Check for Bootstrap modal classes that indicate it's active
      const hasActiveClass =
        modal.classList.contains("in") || modal.classList.contains("show");

      // Check if modal backdrop exists (Bootstrap creates this when modal is active)
      const backdrop = document.querySelector(".modal-backdrop");
      const hasBackdrop = backdrop && backdrop.style.display !== "none";

      // Check if body has modal-open class (Bootstrap adds this when modal is active)
      const bodyHasModalOpen = document.body.classList.contains("modal-open");

      // Additional check: modal should be positioned properly (not off-screen)
      const rect = modal.getBoundingClientRect();
      const isPositioned = rect.width > 0 && rect.height > 0 && rect.top >= 0;

      // Check if the modal has display: block style or is visible through other means
      const hasDisplayBlock =
        style.display === "block" || modal.style.display === "block";

      // Alternative: check if modal is visible through computed styles (even without display: block)
      const isActuallyVisible =
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0;

      // Check if modal contains actual ticket data (not empty)
      const titleElement = modal.querySelector(".modal-title");
      const hasTicketData =
        titleElement && titleElement.textContent.trim().length > 0;

      // Debug information
      const debug = {
        modalExists: true,
        isVisible,
        ariaHidden,
        isNotHidden,
        hasActiveClass,
        hasBackdrop,
        bodyHasModalOpen,
        isPositioned,
        hasDisplayBlock,
        isActuallyVisible,
        hasTicketData,
        displayStyle: style.display,
        modalDisplayStyle: modal.style.display,
        titleText: titleElement
          ? titleElement.textContent.trim()
          : "No title element",
      };

      // All conditions must be met for the modal to be considered active
      // Note: We ignore aria-hidden since it's unreliable with Bootstrap modals
      // Use isActuallyVisible instead of hasDisplayBlock for more flexible detection
      const isActive =
        isVisible &&
        isActuallyVisible &&
        (hasActiveClass || hasBackdrop || bodyHasModalOpen) &&
        isPositioned &&
        hasTicketData;

      return { isActive, debug };
    });

    if (process.env.CONSOLE_LOGS === "true") {
      if (modalInfo.isActive) {
        console.log("✅ Modal pro výběr vstupenek je aktivní");
      } else {
        console.log("❌ Modal pro výběr vstupenek není aktivní");
        console.log("🔍 Debug info:", modalInfo.debug);
      }
    }

    return modalInfo.isActive;
  } catch (error) {
    console.error(
      "❌ Chyba při kontrole modalu pro výběr vstupenek:",
      error.message
    );
    return false;
  }
}

export async function selectTickets(page) {
  if (process.env.EXECUTION_TIME === "true") {
    console.time("⏱️ Výběr vstupenek");
  }
  const ticketCount = process.env.TICKET_COUNT;
  if (!ticketCount) {
    console.error("❌ Není nastaven počet vstupenek");
    return false;
  }
  console.log(`🎫 Pokus o výběr ${ticketCount} vstupenek...`);

  try {
    // Check if the ticket selection modal is active
    const modalActive = await checkIfTicketModalActive(page);

    if (!modalActive) {
      console.error("❌ Modal pro výběr vstupenek není aktivní");
      return false;
    }

    // Try method 1: Universal dropdown selection
    const dropdownSuccess = await selectTicketsViaDropdown(page, ticketCount);

    if (dropdownSuccess) {
      console.log("✅ Vstupenky vybrány pomocí dropdown menu");
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Výběr vstupenek");
      }
      return true;
    }

    // Try method 2: Radio button selection
    const radioSuccess = await selectTicketsViaRadio(page, ticketCount);

    if (radioSuccess) {
      console.log("✅ Vstupenky vybrány pomocí radio buttonů");
      if (process.env.EXECUTION_TIME === "true") {
        console.timeEnd("⏱️ Výběr vstupenek");
      }
      return true;
    }

    console.error("❌ Nepodařilo se vybrat vstupenky žádnou metodou");
    return false;
  } catch (error) {
    console.error("💥 Chyba při výběru vstupenek:", error.message);
    return false;
  }
}

async function selectTicketsViaDropdown(page, ticketCount) {
  try {
    // Universal dropdown selectors - try multiple patterns
    const dropdownSelectors = [
      // New structure selectors
      'select[name*="dis_"][id*="dis_"]',
      'select[name*="dis_"]',
      'select[id*="dis_"]',
      // Old structure selectors
      'select[name="dis_207486_0"]',
      'select[id="dis_207486_0"]',
      // Generic selectors
      ".select-count select",
      ".list-group-discounts select",
    ];

    let dropdownFound = false;
    let selectedDropdown = null;

    for (const selector of dropdownSelectors) {
      try {
        const dropdown = await page.$(selector);
        if (dropdown) {
          console.log(`📋 Nalezen dropdown pomocí selektoru: ${selector}`);
          selectedDropdown = dropdown;
          dropdownFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Dropdown nenalezen pomocí selektoru: ${selector}`);
      }
    }

    if (!dropdownFound) {
      console.log("❌ Žádný dropdown nebyl nalezen");
      return false;
    }

    // Get all available options to check if the desired count is available
    const availableOptions = await page.evaluate(
      (selector) => {
        const select = document.querySelector(selector);
        if (!select) return [];

        return Array.from(select.options).map((option) => ({
          value: option.value,
          text: option.textContent.trim(),
        }));
      },
      dropdownSelectors.find((selector) => selectedDropdown)
    );

    console.log("📋 Dostupné možnosti:", availableOptions);

    // Check if the desired ticket count is available
    const ticketCountStr = ticketCount.toString();
    const isAvailable = availableOptions.some(
      (option) => option.value === ticketCountStr
    );

    if (!isAvailable) {
      console.log(
        `❌ Počet ${ticketCount} vstupenek není dostupný v dropdown menu`
      );
      return false;
    }

    // Select the desired number of tickets
    await page.select(
      dropdownSelectors.find((selector) => selectedDropdown),
      ticketCountStr
    );

    // Wait a moment for the selection to register
    //await sleep(500);

    // Verify the selection was successful
    const selectedValue = await page.$eval(
      dropdownSelectors.find((selector) => selectedDropdown),
      (el) => el.value
    );

    if (selectedValue === ticketCountStr) {
      console.log(`✅ Dropdown: Vybráno ${ticketCount} vstupenek`);
      return true;
    } else {
      console.log(
        `❌ Dropdown: Očekáváno ${ticketCount}, ale vybráno ${selectedValue}`
      );
      return false;
    }
  } catch (error) {
    console.log("❌ Dropdown metoda selhala:", error.message);
    return false;
  }
}

async function selectTicketsViaRadio(page, ticketCount) {
  try {
    // Universal radio button selectors
    const radioSelectors = [
      `#NPerformance_count_${ticketCount}`,
      `[id="NPerformance_count_${ticketCount}"]`,
      `label[id*="NPerformance_count_${ticketCount}"]`,
      `.btn-group-pocet label[id*="count_${ticketCount}"]`,
    ];

    let radioFound = false;
    let selectedRadio = null;

    for (const selector of radioSelectors) {
      try {
        const radio = await page.$(selector);
        if (radio) {
          console.log(`📋 Nalezen radio button pomocí selektoru: ${selector}`);
          selectedRadio = radio;
          radioFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Radio button nenalezen pomocí selektoru: ${selector}`);
      }
    }

    if (!radioFound) {
      console.log("❌ Žádný radio button nebyl nalezen");
      return false;
    }

    // Check if the radio button is disabled
    const isDisabled = await page.$eval(
      radioSelectors.find((selector) => selectedRadio),
      (el) => {
        return (
          el.hasAttribute("disabled") ||
          el.classList.contains("disabled") ||
          el.classList.contains("hidden") ||
          el.style.display === "none"
        );
      }
    );

    if (isDisabled) {
      console.log(
        `❌ Radio button pro ${ticketCount} vstupenek je neaktivní nebo skrytý`
      );
      return false;
    }

    // Click the radio button
    await page.click(radioSelectors.find((selector) => selectedRadio));

    // Wait a moment for the selection to register
    //await sleep(500);

    // Verify the selection was successful
    const isSelected = await page.$eval(
      radioSelectors.find((selector) => selectedRadio),
      (el) => {
        const radio = el.querySelector('input[type="radio"]');
        return radio && radio.checked;
      }
    );

    if (isSelected) {
      console.log(`✅ Radio button: Vybráno ${ticketCount} vstupenek`);
      return true;
    } else {
      console.log(
        `❌ Radio button: Výběr ${ticketCount} vstupenek se nepodařil`
      );
      return false;
    }
  } catch (error) {
    console.log("❌ Radio button metoda selhala:", error.message);
    return false;
  }
}

// Function to continue to basket after ticket selection
export async function continueToBasket(page) {
  try {
    console.log("🛒 Pokračuji do košíku...");

    // Universal basket button selectors
    const basketButtonSelectors = [
      "button.btn-buy.pokracuj-kosik-btn",
      'button[onclick="Nperf_dis_add();"]',
      ".btn-group-footer .btn-buy",
      'button[type="button"].btn-buy',
      ".modal-footer .btn-buy",
    ];

    let basketButton = null;
    let buttonFound = false;

    for (const selector of basketButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(
            `📋 Nalezeno tlačítko košíku pomocí selektoru: ${selector}`
          );
          basketButton = button;
          buttonFound = true;
          break;
        }
      } catch (error) {
        console.log(
          `❌ Tlačítko košíku nenalezeno pomocí selektoru: ${selector}`
        );
      }
    }

    if (!buttonFound) {
      console.log("❌ Žádné tlačítko košíku nebylo nalezeno");
      return false;
    }

    // Check if button is disabled
    const isDisabled = await page.$eval(
      basketButtonSelectors.find((selector) => basketButton),
      (el) => {
        return el.hasAttribute("disabled") || el.disabled;
      }
    );

    if (isDisabled) {
      console.log("❌ Tlačítko košíku je neaktivní");
      return false;
    }

    // Click the basket button
    await page.click(basketButtonSelectors.find((selector) => basketButton));
    console.log("✅ Kliknutí na tlačítko 'Pokračuj do košíku'");

    // Wait for navigation or modal change
    // await sleep(1000);
    return true;
  } catch (error) {
    console.error("💥 Chyba při pokračování do košíku:", error.message);
    return false;
  }
}

// Function to check if any tickets are selected
export async function checkTicketSelection(page) {
  try {
    // Check dropdown selections
    const dropdownSelectors = [
      'select[name*="dis_"][id*="dis_"]',
      'select[name*="dis_"]',
      'select[id*="dis_"]',
    ];

    for (const selector of dropdownSelectors) {
      try {
        const selectedValue = await page.$eval(selector, (el) => el.value);
        if (selectedValue && selectedValue !== "0") {
          console.log(
            `✅ V dropdown menu je vybráno ${selectedValue} vstupenek`
          );
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    // Check radio button selections
    const radioSelectors = [
      '.btn-group-pocet input[type="radio"]:checked',
      '#NPerformance_count_1 input[type="radio"]:checked',
      '#NPerformance_count_2 input[type="radio"]:checked',
      '#NPerformance_count_3 input[type="radio"]:checked',
    ];

    for (const selector of radioSelectors) {
      try {
        const isSelected = await page.$(selector);
        if (isSelected) {
          console.log("✅ Radio button je vybrán");
          return true;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    console.log("❌ Žádné vstupenky nejsou vybrány");
    return false;
  } catch (error) {
    console.error("💥 Chyba při kontrole výběru vstupenek:", error.message);
    return false;
  }
}

export default selectTickets;
