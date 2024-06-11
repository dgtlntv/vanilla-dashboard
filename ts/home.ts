declare var Dexie: any;

var db = new Dexie("WebProperties");

db.version(1).stores({
  sites: `
    ++id,
    url`,
});

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

  sheetValues.forEach((rowData) => {
    const tableRowEl = constructTableRow(rowData);

    virtualTableBodyEl.appendChild(tableRowEl);
  });

  vanillaUsageStatsTable.appendChild(virtualTableBodyEl);

  vanillaUsageStatsStatusBar.textContent = `${sheetValues.length} rows retrieved.`;
}

async function saveSheetDataToIndexedDb(sheetValues: Array<any>) {
  console.log(sheetValues);

  const convertedSheetValues = sheetValues.map((valueArr) => ({
    url: valueArr[0],
    numElementsWithClassNames: valueArr[1],
    numPureVanillaElements: valueArr[2],
    numDirtyVanillaElements: valueArr[3],
    percentPureVanillaUsage: valueArr[4],
    percentDirtyVanillaUsage: valueArr[5],
    percentPureVsDirtyUsage: valueArr[6],
  }));

  console.log(convertedSheetValues);

  await db.sites.clear();

  await db.sites.bulkPut(convertedSheetValues).catch((err: any) => {
    console.log("Error performing db bulkPut:", err);
  });
}

async function pullDataFromSheet() {
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
      range: "Metrics",
    });

    sheetValues = sheetResponse.result.values;
  } catch (err) {
    throw new Error("Error getting sheet values - check your spreadsheet ID!");
  }

  if (sheetValues && sheetValues.length) {
    // Hack because the Sheets data currently has headers in the first row
    const sheetValuesMinusHeaders = sheetValues.slice(1);

    renderSheetData(sheetValuesMinusHeaders);

    saveSheetDataToIndexedDb(sheetValuesMinusHeaders);
  } else {
    throw new Error("No sheet values found!");
  }
}

async function pullDataFromIdb() {
  const sitesDbItems = await db.sites.toArray();

  console.log(sitesDbItems);

  const convertedDbItems = sitesDbItems.map((item: any): any => [
    item.url,
    item.numElementsWithClassNames,
    item.numPureVanillaElements,
    item.numDirtyVanillaElements,
    item.percentPureVanillaUsage,
    item.percentDirtyVanillaUsage,
    item.percentPureVsDirtyUsage,
  ]);

  console.log(convertedDbItems);

  renderSheetData(convertedDbItems);
}

async function retrieveSheetData() {
  vanillaUsageStatsStatusBar.textContent = "Retrieving data...";

  const idbCount = await db.sites.count();

  if (idbCount) {
    console.log("pull from idb");

    await pullDataFromIdb();
  } else {
    console.log("pull from sheet");

    await pullDataFromSheet();
  }
}

gapi.load("client", retrieveSheetData);
