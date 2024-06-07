const vanillaUsageStatsTable = document.getElementById(
  "vanilla-usage-stats-table"
);
const vanillaUsageStatsStatusBar = document.getElementById(
  "vanilla-usage-stats-status-bar"
);

function constructTableRow(rowData: Array<any>) {
  const tableRowEl = document.createElement("tr");

  rowData.forEach((cellData, index) => {
    const tableCellEl = document.createElement("td");

    if (index === 0) {
      const linkEl = document.createElement("a");

      linkEl.href = `/site?url=${encodeURIComponent(cellData)}`;
      linkEl.textContent = cellData;

      tableCellEl.appendChild(linkEl);
    } else {
      tableCellEl.textContent = cellData;
    }

    tableRowEl.appendChild(tableCellEl);
  });

  return tableRowEl;
}

function renderSheetData(sheetValues: Array<any>) {
  console.log(sheetValues);

  const virtualTableBodyEl = document.createDocumentFragment();

  sheetValues.forEach((rowData, index) => {
    // Hack because the Sheets data currently has headers in the first row
    if (index !== 0) {
      const tableRowEl = constructTableRow(rowData);

      virtualTableBodyEl.appendChild(tableRowEl);
    }
  });

  vanillaUsageStatsTable.appendChild(virtualTableBodyEl);

  vanillaUsageStatsStatusBar.textContent = `${sheetValues.length} rows retrieved.`;
}

async function retrieveSheetData() {
  vanillaUsageStatsStatusBar.textContent = "Retrieving data...";

  try {
    await gapi.client.init({
      apiKey: "AIzaSyDdu12mIqCIryiiwgpDshVIRg-ZiBOWl_I",
      discoveryDocs: [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
      ],
    });
  } catch (error) {
    throw new Error("Error initializing gapi client - check your API key!");
  }

  let sheetValues;

  try {
    const sheetResponse = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: "1vL8Z7BhmcLxkNGKQm6emI0gQwy_e4Lvq5PUqdCEw7C4",
      range: "Sheet1",
    });

    sheetValues = sheetResponse.result.values;
  } catch (err) {
    throw new Error("Error getting sheet values - check your spreadsheet ID!");
  }

  if (sheetValues && sheetValues.length) {
    renderSheetData(sheetValues);
  } else {
    throw new Error("No sheet values found!");
  }
}

gapi.load("client", retrieveSheetData);
