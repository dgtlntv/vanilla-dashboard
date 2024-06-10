const figmaSourceMixTable = document.getElementById("figma-source-mix-table")
const figmaLibraryMixTable = document.getElementById("figma-library-mix-table")
const figmaDetachedTable = document.getElementById("figma-detached-table")

function constructTableRowFigma(rowData: Array<any>) {
    const tableRowEl = document.createElement("tr")
    rowData.forEach((cellData) => {
        const tableCellEl = document.createElement("td")
        tableCellEl.textContent = cellData
        tableRowEl.appendChild(tableCellEl)
    })
    return tableRowEl
}

function renderSheetDataFigma(sheetName: string, sheetValues: Array<any>) {
    console.log(sheetValues)
    const virtualTableBodyEl = document.createDocumentFragment()
    sheetValues.forEach((rowData, index) => {
        // Hack because the Sheets data currently has headers in the first row
        if (index !== 0) {
            const tableRowEl = constructTableRowFigma(rowData)
            virtualTableBodyEl.appendChild(tableRowEl)
        }
    })

    let targetTable
    if (sheetName === "Source mix (custom vs components)") {
        targetTable = figmaSourceMixTable
    } else if (sheetName === "Library mix") {
        targetTable = figmaLibraryMixTable
    } else if (sheetName === "Detached components") {
        targetTable = figmaDetachedTable
    }

    if (targetTable) {
        targetTable.appendChild(virtualTableBodyEl)
    }
}

async function retrieveSheetDataFigma() {
    try {
        await gapi.client.init({
            apiKey: "AIzaSyDdu12mIqCIryiiwgpDshVIRg-ZiBOWl_I",
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        })
    } catch (error) {
        throw new Error("Error initializing gapi client - check your API key!")
    }

    const sheetNames = ["Source mix (custom vs components)", "Library mix", "Detached components"]
    for (const sheetName of sheetNames) {
        try {
            const sheetResponse = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: "1KC8k0460COgU9ZxBP9CRLEuunOjz4TlsQy4p82BNlA4",
                range: sheetName,
            })
            const sheetValues = sheetResponse.result.values
            if (sheetValues && sheetValues.length) {
                renderSheetDataFigma(sheetName, sheetValues)
            } else {
                console.warn(`No sheet values found for sheet: ${sheetName}`)
            }
        } catch (err) {
            console.error(`Error getting sheet values for sheet: ${sheetName} - check your spreadsheet ID!`)
        }
    }
}

gapi.load("client", retrieveSheetDataFigma)
