// TODO: eigene Firebase-Realtime-Database-URL eintragen (mit "/" am Ende)
const BASE_URL = "https://DEIN-PROJEKT-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path = "") {
	const response = await fetch(BASE_URL + path + ".json");
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}
	return response.json();
}

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
			.map(([id, value]) => ({ id, ...value }));

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
