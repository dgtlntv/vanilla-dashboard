declare var Dexie: any
var db = new Dexie("FigmaData")
db.version(1).stores({
    sourceMix: `
    ++id,
    data`,
    libraryMix: `
    ++id,
    data`,
    detachedComponents: `
    ++id,
    data`,
})

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
        targetTable.innerHTML = "" // Clear existing table content
        targetTable.appendChild(virtualTableBodyEl)
    }
}

async function saveSheetDataFigmaToIndexedDb(sheetName: string, sheetValues: Array<any>) {
    const convertedSheetValues = sheetValues.map((valueArr) => ({
        data: valueArr,
    }))

    switch (sheetName) {
        case "Source mix (custom vs components)":
            await db.sourceMix.clear()
            await db.sourceMix.bulkPut(convertedSheetValues).catch((err: any) => {
                console.log("Error performing db bulkPut:", err)
            })
            break
        case "Library mix":
            await db.libraryMix.clear()
            await db.libraryMix.bulkPut(convertedSheetValues).catch((err: any) => {
                console.log("Error performing db bulkPut:", err)
            })
            break
        case "Detached components":
            await db.detachedComponents.clear()
            await db.detachedComponents.bulkPut(convertedSheetValues).catch((err: any) => {
                console.log("Error performing db bulkPut:", err)
            })
            break
    }
}

async function pullDataFromFigmaIdb() {
    const sourceMixDbItems = await db.sourceMix.toArray()
    const libraryMixDbItems = await db.libraryMix.toArray()
    const detachedComponentsDbItems = await db.detachedComponents.toArray()

    const convertedSourceMixData = sourceMixDbItems.map((item: any): any => item.data)
    const convertedLibraryMixData = libraryMixDbItems.map((item: any): any => item.data)
    const convertedDetachedComponentsData = detachedComponentsDbItems.map((item: any): any => item.data)

    renderSheetDataFigma("Source mix (custom vs components)", convertedSourceMixData)
    renderSheetDataFigma("Library mix", convertedLibraryMixData)
    renderSheetDataFigma("Detached components", convertedDetachedComponentsData)
}

async function retrieveSheetDataFigma() {
    await pullDataFromFigmaIdb()
    checkForUpdatesFromSheet()
}

async function checkForUpdatesFromSheet() {
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
                const cachedData = await getDataFromIdb(sheetName)
                if (!isDataEqual(cachedData, sheetValues)) {
                    console.log("Data outdated, updating DB")

                    await saveSheetDataFigmaToIndexedDb(sheetName, sheetValues)
                    renderSheetDataFigma(sheetName, sheetValues)
                }
            } else {
                console.warn(`No sheet values found for sheet: ${sheetName}`)
            }
        } catch (err) {
            console.error(`Error getting sheet values for sheet: ${sheetName} - check your spreadsheet ID!`)
        }
    }
}

async function getDataFromIdb(sheetName: string) {
    switch (sheetName) {
        case "Source mix (custom vs components)":
            return await db.sourceMix.toArray()
        case "Library mix":
            return await db.libraryMix.toArray()
        case "Detached components":
            return await db.detachedComponents.toArray()
    }
}

function isDataEqual(cachedData: any[], sheetValues: any[]) {
    // Compare the cached data with the sheet values and return true if they are equal
    return JSON.stringify(cachedData) === JSON.stringify(sheetValues)
}

gapi.load("client", retrieveSheetDataFigma)
