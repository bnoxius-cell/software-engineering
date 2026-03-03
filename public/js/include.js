function highlightActiveLink() {
  const currentPage = window.location.pathname.split("/").pop();

  const links = document.querySelectorAll(".sidebar .menu-link");

  links.forEach(link => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.closest(".menu-item").classList.add("active");
    }
  });
}

fetch("/pages/components/header.html")
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
      }, 200); // Delay to allow hover before going away (THIS IS IN Milliseconds :DD)
    }

    trigger.addEventListener("mouseenter", showMenu);
    menu.addEventListener("mouseenter", showMenu);

    trigger.addEventListener("mouseleave", hideMenu);
    menu.addEventListener("mouseleave", hideMenu);
  })
  .catch(err => console.error("Header load failed", err));

fetch("/pages/components/footer.html") 
  .then(response => response.text()) 
  .then(html => { document.getElementById("footer").innerHTML = html; 
  }) 
  .catch(err => console.error("Footer load failed", err));
  
fetch("/pages/components/sidebar.html") 
  .then(response => response.text()) 
  .then(html => { document.getElementById("sidebar").innerHTML = html; 
  highlightActiveLink();
  }) 
  .catch(err => console.error("Sidebar load failed", err));