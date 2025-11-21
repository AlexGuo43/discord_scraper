// ======================================================
// FULL AUTO-SCROLL UNTIL DATE + AUTO-EXTRACT + AUTO-SAVE
// ======================================================

// ▼▼ MODIFY THIS ▼▼
// STOP when oldest message <= STOP_AT
// const STOP_AT = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days
const STOP_AT = new Date("2025-11-19"); // Or choose a specific date
// ^ YYYY-MM-DD
// ▲▲ MODIFY THIS ▲▲

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Identify the channel scroller that contains messages
function findChannelScroller() {
    const msgSelector = '[class*="messageListItem"]';
    const scrollCandidates = [...document.querySelectorAll('[class*="scroller"]')];

    const valid = scrollCandidates.filter(el =>
        el.scrollHeight > el.clientHeight + 50 &&
        el.clientHeight > 200 &&
        el.querySelector(msgSelector)
    );

    return valid.sort((a, b) => b.clientHeight - a.clientHeight)[0] || null;
}

// Extract all loaded messages
function extractMessages() {
    const nodes = document.querySelectorAll('[class*="messageListItem"]');
    let out = [];

    nodes.forEach(n => {
        const user = n.querySelector('[class*="username"]')?.textContent?.trim() || "";
        const timestamp = n.querySelector("time")?.getAttribute("datetime") || "";
        const content = n.querySelector('[class*="markup"]')?.textContent?.trim() || "";

        if (user && timestamp && content)
            out.push({ user, timestamp, content, dateObj: new Date(timestamp) });
    });

    return out;
}

// Convert to CSV + download automatically
function exportCSV(rows) {
    const csv = [
        "user,timestamp,message",
        ...rows.map(r =>
            `"${r.user}","${r.timestamp}","${r.content.replace(/"/g, '""')}"`
        )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "discord_channel_history.csv";
    a.click();
}

async function runFullHistoryExtract() {
    const scroller = findChannelScroller();
    if (!scroller) return console.error("❌ Could not find channel scroller.");

    console.log("📡 Starting… stopping once older than:", STOP_AT);

    let lastMsgCount = 0;
    let sameCount = 0;
    let oldest = null;

    while (true) {
        scroller.scrollTop = 0;  // scroll up
        await sleep(1200);       // wait for Discord to load older messages

        const msgs = extractMessages();
        const count = msgs.length;

        if (count !== lastMsgCount) {
            console.log(`Loaded ${count} messages…`);
            lastMsgCount = count;
        }

        // Find oldest message visible
        oldest = msgs.reduce((a, b) => a.dateObj < b.dateObj ? a : b).dateObj;
        console.log("Oldest:", oldest);

        // STOP CONDITION
        if (oldest <= STOP_AT) {
            console.log("🎉 Reached target date window. Extracting + saving CSV.");

            exportCSV(msgs); // auto-download
            window.__discordExport = msgs;

            console.log("✅ DONE.");
            return;
        }

        // Fail-safe
        if (sameCount >= 5) {
            console.warn("⚠️ No more messages loading. Saving what we have.");
            exportCSV(msgs);
            window.__discordExport = msgs;
            return;
        }

        if (scroller.scrollTop === 0) sameCount++; else sameCount = 0;
    }
}

// Run everything
runFullHistoryExtract();
