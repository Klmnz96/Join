/**
 * Loads the layout parts (sidebar, header) and marks the current page in the menu.
 */
async function initLayout() {
  await includeHTML();
  setActiveLink();
}

/**
 * Loads every element with a w3-include-html attribute from its template file.
 */
async function includeHTML() {
  let elements = document.querySelectorAll("[w3-include-html]");
  for (let element of elements) {
    let file = element.getAttribute("w3-include-html");
    let response = await fetch(file);
    element.innerHTML = response.ok ? await response.text() : "Page not found";
  }
}

/**
 * Returns the name of the current page without ".html", e.g. "board".
 * @returns {string} The page name.
 */
function getCurrentPage() {
  let fileName = window.location.pathname.split("/").pop();
  return fileName.replace(".html", "");
}

/**
 * Adds the class "active" to every menu link that belongs to the current page.
 */
function setActiveLink() {
  let page = getCurrentPage();
  let links = document.querySelectorAll(`[data-page="${page}"]`);
  for (let link of links) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
}

/**
 * Applies the saved color theme, so every page opens in the same mode.
 */
function applySavedTheme() {
  let theme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * Switches between light and dark mode and saves the choice.
 */
function toggleTheme() {
  let isDark = document.documentElement.getAttribute("data-theme") === "dark";
  let newTheme = isDark ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

/**
 * Opens or closes the user menu in the header.
 */
function toggleUserMenu() {
  let menu = document.getElementById("userMenu");
  let button = document.querySelector(".header-profile");
  menu.hidden = !menu.hidden;
  button.setAttribute("aria-expanded", !menu.hidden);
}

/**
 * Closes the user menu when the user clicks somewhere else on the page.
 * @param {MouseEvent} event - The click event.
 */
function closeUserMenuOnOutsideClick(event) {
  let menu = document.getElementById("userMenu");
  if (!menu || menu.hidden || event.target.closest(".header-actions")) return;
  menu.hidden = true;
  document
    .querySelector(".header-profile")
    .setAttribute("aria-expanded", "false");
}

/**
 * Logs the user out and goes back to the login page.
 * The login feature can be extend this later (e.g. clear the saved user).
 */
function logout() {
  window.location.href = "../../index.html";
}

applySavedTheme();
document.addEventListener("click", closeUserMenuOnOutsideClick);


function load