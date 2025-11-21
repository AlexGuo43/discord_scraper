# Discord Scraper

Some simple scripts to extract message text data from a Discord server search bar results or text from a channel.

For the text from the channel, the script will auto scroll, load new messages, and save it. Repeats until a specified date. For the search bar, the intention of the script is to extract as many pages of text from search results as possible. Please note that Discord limits these search queries to 400 pages of results (full history cannot be retrieved).

# How to use

Log in to Discord web, then bring up Developer tools and in the Javascript console, paste the script either under the `channel` folder or `search_bar` folder. For the channel script, the messages will be auto saved to a csv and downloaded. For the search_bar script, you have to manually run `extract.js` after `collect.js`.
