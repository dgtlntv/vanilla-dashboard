function constructTableRow(rowData: Array<any>) {
  const tableRowEl = document.createElement("tr");

  rowData.forEach((cellData) => {
    const tableCellEl = document.createElement("td");

    tableCellEl.textContent = cellData;

    tableRowEl.appendChild(tableCellEl);
  });

  return tableRowEl;
}

function renderSheetData(sheetValues: Array<any>) {
  console.log(sheetValues);

  const vanillaUsageStatsTable = document.getElementById(
    "vanilla-usage-stats-table"
  );
  const virtualTableBodyEl = document.createDocumentFragment();

  sheetValues.forEach((rowData, index) => {
    // Hack because the Sheets data currently has headers in the first row
    if (index !== 0) {
      const tableRowEl = constructTableRow(rowData);

      virtualTableBodyEl.appendChild(tableRowEl);
    }
  });

  vanillaUsageStatsTable.appendChild(virtualTableBodyEl);
}

async function retrieveSheetData() {
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

  renderSheetData(sheetValues);
}

gapi.load("client", retrieveSheetData);
