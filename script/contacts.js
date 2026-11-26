/**
 * Loads all contacts from Firebase and renders them into the contact list,
 * sorted alphabetically by name.
 */
async function renderContacts() {
  const container = document.getElementById("contacts-list-contact");
  if (!container) return;
  container.innerHTML = "";

  try {
    const data = await loadData("contacts");

    if (!data) {
      container.textContent = "Keine Kontakte vorhanden.";
      return;
    }

    const contacts = Object.entries(data)
      .filter(([, value]) => value !== null)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", "de", { sensitivity: "base" })
      );

    contacts.forEach((contact) => {
      const card = document.createElement("div");
      card.className = "contact-card";
      card.dataset.id = contact.id;

      const name = document.createElement("h3");
      name.textContent = contact.name ?? "";

      const email = document.createElement("p");
      email.textContent = contact.email ?? "";

      const phone = document.createElement("p");
      phone.textContent = contact.phone ?? "";

      card.append(name, email, phone);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Kontakte konnten nicht geladen werden:", error);
    container.textContent = "Fehler beim Laden der Daten.";
  }
}
