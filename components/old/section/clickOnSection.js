export async function clickOnSection(page, sectionNumber = "106") {
  // Selector for the "Seznam dostupných míst" button
  const listButtonSelector = "#zoznam-volnych-miest-text";

  // Click on the button to reveal the list
  await page.waitForSelector(listButtonSelector, { visible: true });
  await page.click(listButtonSelector);
  console.log("Clicked on the 'Seznam dostupných míst' button.");

  // Use page.evaluate to find and click the section
  const result = await page.evaluate((sectionNumber) => {
    const spans = Array.from(
      document.querySelectorAll("span.list-group-item-text")
    );
    let targetSpan = spans.find(
      (span) => span.textContent.trim() === sectionNumber
    );

    if (!targetSpan && spans.length > 0) {
      targetSpan = spans[0]; // Fallback to the first available section
      const firstSectionNumber = targetSpan.textContent.trim();
      const link = targetSpan.closest("a");
      if (link) {
        link.click();
        return `Section with number ${sectionNumber} not found. Clicked on the first available section with number ${firstSectionNumber}.`;
      } else {
        return `Link for the first available section with number ${firstSectionNumber} not found.`;
      }
    }

    if (targetSpan) {
      const link = targetSpan.closest("a");
      if (link) {
        link.click();
        return `Clicked on section with number ${sectionNumber}.`;
      } else {
        return `Link for section number ${sectionNumber} not found.`;
      }
    } else {
      return "No sections available to click.";
    }
  }, sectionNumber);

  console.log(result);
}
