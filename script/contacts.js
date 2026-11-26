const AVATAR_COLORS = ["#6e3cff", "#e96fff", "#f4b620", "#4fd1b5", "#3d2a8c", "#ff7a00"];

/** Lädt die Kontakte aus Firebase und zeigt sie an. */
async function renderContacts() {
  const container = document.getElementById("contacts-list-contact");
  if (!container) return;
  try {
    const data = await loadData("contacts");
    const contacts = sortContactsByName(toContactArray(data));
    showContacts(container, contacts);
  } catch (error) {
    console.error("Kontakte konnten nicht geladen werden:", error);
    showLoadError(container);
  }
}

/** Wandelt die Firebase-Daten in eine Liste um (ID wird Eigenschaft). */
function toContactArray(data) {
  return Object.entries(data ?? {})
    .filter(([, value]) => value !== null)
    .map(([id, value]) => ({ id, ...value }));
}

/** Sortiert die Kontakte alphabetisch nach Name. */
function sortContactsByName(contacts) {
  return contacts.sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", "de", { sensitivity: "base" })
  );
}

/** Gibt den Anfangsbuchstaben zurück ("Ärzte" ergibt "A", ohne Namen "#"). */
function getInitial(contact) {
  const first = (contact.name ?? "").trim().charAt(0);
  return first.normalize("NFD").charAt(0).toUpperCase() || "#";
}

/** Gruppiert die Kontakte nach Anfangsbuchstabe. */
function groupByInitial(contacts) {
  const groups = new Map();
  contacts.forEach((contact) => {
    const letter = getInitial(contact);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(contact);
  });
  return groups;
}

/** Bildet die Avatar-Initialen ("Benedikt Ziegler" ergibt "BZ"). */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  const last = parts.length > 1 ? parts.at(-1)[0] : "";
  return ((parts[0]?.[0] ?? "") + last).toUpperCase();
}

/** Wählt eine feste Avatar-Farbe passend zum Namen. */
function getAvatarColor(name = "") {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/** Erstellt ein Element mit Text (sicher, ohne HTML). */
function createTextElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text ?? "";
  return element;
}

/** Erstellt den runden Avatar mit Initialen. */
function createAvatar(contact) {
  const avatar = createTextElement("div", getInitials(contact.name));
  avatar.className = "contact-avatar";
  avatar.style.backgroundColor = getAvatarColor(contact.name);
  return avatar;
}

/** Erstellt die Kontaktkarte mit Avatar, Name und E-Mail. */
function createContactCard(contact) {
  const info = document.createElement("div");
  info.append(createTextElement("h3", contact.name), createTextElement("p", contact.email));
  const card = document.createElement("div");
  card.className = "contact-card";
  card.dataset.id = contact.id;
  card.append(createAvatar(contact), info);
  return card;
}

/** Erstellt einen Buchstaben-Abschnitt mit seinen Kontakten. */
function createContactGroup(letter, contacts) {
  const group = document.createElement("section");
  group.className = "contact-group";
  group.append(createTextElement("h2", letter), ...contacts.map(createContactCard));
  return group;
}

/** Zeigt die gruppierten Kontakte oder einen Hinweis, wenn keine da sind. */
function showContacts(container, contacts) {
  if (!contacts.length) {
    container.textContent = "Keine Kontakte vorhanden.";
    return;
  }
  const groups = [...groupByInitial(contacts)];
  container.replaceChildren(...groups.map(([letter, list]) => createContactGroup(letter, list)));
}

/** Zeigt eine Fehlermeldung statt der Kontaktliste. */
function showLoadError(container) {
  container.textContent = "Fehler beim Laden der Daten.";
}