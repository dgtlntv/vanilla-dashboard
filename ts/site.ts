const queryParams = new URLSearchParams(window.location.search);
const siteUrl = queryParams.get("url");

const siteUrlEl = document.getElementById("vanilla-usage-site-url");

siteUrlEl.textContent = siteUrl;
