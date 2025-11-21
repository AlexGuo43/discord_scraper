// ===============================
// Discord Search Full Pagination Extractor
// ===============================

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- 1. Extract one batch of loaded search results ----
function extractBatch() {
    const results = document.querySelectorAll('[class*="searchResult"]');

    let rows = [];

    results.forEach(r => {
        const user = r.querySelector('[class*="username"]')?.textContent.trim() || "";
        const timestamp = r.querySelector('time')?.getAttribute('datetime') || "";
        const message = r.querySelector('[class*="markup"]')?.textContent.trim() || "";

        if (user && message) {
            rows.push({ user, timestamp, message });
        }
    });

    return rows;
}

// ---- 2. Find Discord's pagination button ----
function findNextButton() {
    // Try a variety of selectors

    // Buttons with text content
    const candidates = [...document.querySelectorAll("button, div, span")]
        .filter(el => {
            const text = el.textContent?.trim().toLowerCase() || "";
            return (
                text === "next" ||
                text === "more results" ||
                text === "load more" ||
                text.includes("older") ||
                text.includes("newer")
            );
        });

    if (candidates.length > 0) return candidates[0];

    // Icon-only button (arrow)
    const arrowBtn = document.querySelector('[class*="pagination"] [class*="button"]');
    if (arrowBtn) return arrowBtn;

    // Link-styled buttons
    const linkBtn = document.querySelector('[class*="lookLink"]');
    if (linkBtn) return linkBtn;

    return null;
}

// ---- 3. Scroll the search results panel ----
function getScroller() {
    return document.querySelector('div.scroller_a9e706.thin_d125d2.scrollerBase_d125d2');
}

// ---- 4. Main routine: scroll → click pagination → extract ----
async function fullSearchExtractor() {
    let allData = [];
    let page = 1;

    while (true) {
        console.log(`📄 Extracting page ${page}...`);

        // Scroll bottom to ensure results are fully rendered
        const scroller = getScroller();
        if (scroller) {
            scroller.scrollTo(0, scroller.scrollHeight);
            await sleep(800);
        }

        // Extract this page
        const batch = extractBatch();
        console.log(`    ➜ Found ${batch.length} results on this page`);

        allData.push(...batch);

        // Find the pagination button
        const nextBtn = findNextButton();

        if (!nextBtn) {
            console.log("🎉 No next button found. Finished all pages.");
            break;
        }

        console.log("👉 Clicking next button:", nextBtn);
        nextBtn.click();

        await sleep(1500); // wait for next page to fully load
        page++;
    }

    console.log(`\n✅ DONE! Extracted a total of ${allData.length} messages.`);
    window.__discordSearchFullExtract = allData;
}

fullSearchExtractor();
