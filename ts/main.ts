// @ts-nocheck

function setupAppLayoutExamples() {
  var aside = document.querySelector(".l-aside");
  var navigation = document.querySelector(".l-navigation");

  var menuToggle = document.querySelector(".js-menu-toggle");
  var menuClose = document.querySelector(".js-menu-close");
  var menuPin = document.querySelector(".js-menu-pin");
  var asideOpen = document.querySelector(".js-aside-open");
  var asideClose = document.querySelector(".js-aside-close");
  var asideResize = document.querySelectorAll(".js-aside-resize");
  var asidePin = document.querySelector(".js-aside-pin");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      navigation.classList.toggle("is-collapsed");
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", function (e) {
      navigation.classList.add("is-collapsed");
      (document.activeElement as HTMLElement).blur();
    });
  }

  if (asideOpen) {
    asideOpen.addEventListener("click", function () {
      aside.classList.remove("is-collapsed");
    });
  }

  if (asideClose) {
    asideClose.addEventListener("click", function () {
      aside.classList.add("is-collapsed");
    });
  }

  [].slice.call(asideResize).forEach(function (button: HTMLButtonElement) {
    button.addEventListener("click", function () {
      button.dataset.resizeClass;
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      if (panel) {
        panel.classList.remove("is-narrow");
        panel.classList.remove("is-medium");
        panel.classList.remove("is-wide");
        if (button.dataset.resizeClass) {
          panel.classList.add(button.dataset.resizeClass);
        }
      }
    });
  });

  if (menuPin) {
    menuPin.addEventListener("click", function () {
      navigation.classList.toggle("is-pinned");
      if (navigation.classList.contains("is-pinned")) {
        menuPin.querySelector("i").classList.add("p-icon--close");
        menuPin.querySelector("i").classList.remove("p-icon--pin");
      } else {
        menuPin.querySelector("i").classList.add("p-icon--pin");
        menuPin.querySelector("i").classList.remove("p-icon--close");
      }
      (document.activeElement as HTMLElement).blur();
    });
  }

  if (asidePin) {
    asidePin.addEventListener("click", function () {
      aside.classList.toggle("is-pinned");
      if (aside.classList.contains("is-pinned")) {
        (asidePin as HTMLElement).innerText = "Unpin";
      } else {
        (asidePin as HTMLElement).innerText = "Pin";
      }
    });
  }
}

setupAppLayoutExamples();

function constructTableRow(rowData) {
  const tableRowEl = document.createElement("tr");

  rowData.forEach((cellData) => {
    const tableCellEl = document.createElement("td");

    tableCellEl.textContent = cellData;

    tableRowEl.appendChild(tableCellEl);
  });

  return tableRowEl;
}

function renderSheetData(sheetValues) {
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
