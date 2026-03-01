fetch("../pages/components/footer.html")
  .then(response => response.text())
  .then(html => {
    document.getElementById("footer").innerHTML = html;
  })
  .catch(err => console.error("Footer load failed", err));

fetch("../pages/components/header.html")
  .then(response => response.text())
  .then(html => {
    document.getElementById("header").innerHTML = html;
  })
  .catch(err => console.error("Header load failed", err));