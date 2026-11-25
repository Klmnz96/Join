/**
 * Shows the greeting intro on mobile only once per session (after login).
 * The animation itself is defined in summary.css (.summary-greeting-intro).
 */
function showGreetingIntro() {
  if (sessionStorage.getItem("greetingShown")) return;
  document
    .querySelector(".summary-greeting")
    .classList.add("summary-greeting-intro");
  sessionStorage.setItem("greetingShown", "true");
}
