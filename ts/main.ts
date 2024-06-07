function setupAppLayoutExamples() {
  var navigation = document.querySelector(".l-navigation");

  var menuToggle = document.querySelector(".js-menu-toggle");
  var menuClose = document.querySelector(".js-menu-close");
  var menuPin = document.querySelector(".js-menu-pin");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      navigation.classList.toggle("is-collapsed");
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", function () {
      navigation.classList.add("is-collapsed");
      (document.activeElement as HTMLElement).blur();
    });
  }

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
}

setupAppLayoutExamples();
