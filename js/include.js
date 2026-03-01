fetch("../pages/components/header.html")
  .then(response => response.text())
  .then(html => {
    document.getElementById("header").innerHTML = html;

    const dropdown = document.querySelector(".dropdown-container");
    const trigger = dropdown.querySelector(".dropdown-trigger");
    const menu = dropdown.querySelector(".dropdown-menu");

    let hideTimeout;

    function showMenu() {
      clearTimeout(hideTimeout);
      menu.style.opacity = "1";
      menu.style.visibility = "visible";
      menu.style.pointerEvents = "auto";
      menu.style.transform = "translateY(0)";
    }

    function hideMenu() {
      hideTimeout = setTimeout(() => {
        menu.style.opacity = "0";
        menu.style.visibility = "hidden";
        menu.style.pointerEvents = "none";
      }, 200); // Delay to allow hover before going away
    }

    trigger.addEventListener("mouseenter", showMenu);
    menu.addEventListener("mouseenter", showMenu);

    trigger.addEventListener("mouseleave", hideMenu);
    menu.addEventListener("mouseleave", hideMenu);
  })
  .catch(err => console.error("Header load failed", err));