const BASE_URL =
  "https://join-534e0-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Loads data from the Firebase Realtime Database.
 * @param {string} path - Path in the database, e.g. "tasks" or "contacts".
 * @returns {Promise<Object|null>} The data as object, or null if the path is empty.
 */

async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  return await response.json();
}

/**
 * Saves a new entry in the database. Firebase creates a unique id.
 * @param {string} path - Path in the database, e.g. "tasks".
 * @param {Object} data - The data to save.
 * @returns {Promise<Object>} Object with the new id, e.g. { name: "-Nx3kAbC12"}
 */

async function postData(path, data) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * Saves data at an exact path and overwrites what was there before.
 * Used to update an existing entry, e.g. "tasks/-Nx3kAbC12".
 * @param {string} path - Exact path in the database, including the id.
 * @param {Object} data - The complete new data for this entry.
 * @returns {Promise<Object>} The saved data.
 */
async function putData(path, data) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * Deletes the entry at the given path.
 * @param {string} path - Exact path in the database, e.g. "contacts/-Nx3kAbC12".
 * @returns {Promise<null>} Firebase returns null after deleting.
 */
async function deleteData(path) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",
  });
  return await response.json();
}
