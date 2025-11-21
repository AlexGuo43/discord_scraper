function saveCSV(rows) {
    const csv = [
        "user,timestamp,message",
        ...rows.map(r =>
            `"${r.user}","${r.timestamp}","${r.message.replace(/"/g, '""')}"`
        )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "discord_full_search_export.csv";
    a.click();
}

saveCSV(window.__discordSearchFullExtract);
