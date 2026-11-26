let selectedPrio = "medium";
let selectedCategory = "";
let selectedContacts = [];
let selectedStatus = "toDo";
let subtasks = [];
let editingSubtask = -1;
let contacts = [];
let onTaskCreated = null;

/**
 * Starts the Add Task page: first the layout, then the form.
 */
async function initAddTaskPage() {
  await initLayout();
  await initAddTask("addTaskPage");
}

/**
 * Loads the form template into a container and prepares it.
 * Also used by the board dialog.
 * @param {string} containerId - ID of the element that receives the form.
 * @param {string} status - Column status for the new task, e.g. "inProgress".
 * @param {Function|null} onDone - Called after saving (board dialog). Without it, the page goes to the board.
 */
async function initAddTask(containerId, status = "toDo", onDone = null) {
  selectedStatus = status;
  onTaskCreated = onDone;
  let response = await fetch("../templates/addTaskForm.html");
  document.getElementById(containerId).innerHTML = await response.text();
  resetState();
  contacts = await loadContacts();
  renderAssignedList();
  document.addEventListener("click", closeDropdownsOnOutsideClick);
}

/**
 * Resets all stored selections to their defaults.
 */
function resetState() {
  selectedPrio = "medium";
  selectedCategory = "";
  selectedContacts = [];
  subtasks = [];
  editingSubtask = -1;
}

/**
 * Loads all contacts. TODO: connect the real data source.
 * @returns {Promise<Array>} List of contacts {id, name, color}.
 */
async function loadContacts() {
  return [];
}

/**
 * Saves a task. TODO: connect the real data source.
 * @param {Object} task - The task to save.
 */
async function saveTask(task) {
  return task;
}

/**
 * Escapes text so it can be placed safely in HTML.
 * @param {string} text - Raw text.
 * @returns {string} Escaped text.
 */
function escapeHtml(text) {
  let box = document.createElement("div");
  box.textContent = text;
  return box.innerHTML;
}

/**
 * Selects a priority and marks its button.
 * @param {string} prio - "urgent", "medium" or "low".
 */
function selectPrio(prio) {
  selectedPrio = prio;
  document.querySelectorAll(".prio-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.prio === prio);
  });
}

/**
 * Opens or closes the category dropdown.
 */
function toggleCategoryDropdown() {
  let list = document.getElementById("categoryList");
  list.hidden = !list.hidden;
}

/**
 * Sets the category and closes the dropdown.
 * @param {string} category - Category name.
 */
function selectCategory(category) {
  selectedCategory = category;
  document.getElementById("categoryLabel").textContent = category;
  document.getElementById("categoryList").hidden = true;
  clearFieldError("taskCategory");
}

/**
 * Opens or closes the assigned-to dropdown.
 */
function toggleAssignedDropdown() {
  let list = document.getElementById("assignedList");
  list.hidden = !list.hidden;
}

/**
 * Renders the contact list inside the assigned-to dropdown.
 */
function renderAssignedList() {
  let list = document.getElementById("assignedList");
  let html = contacts.map(getContactItemHtml).join("");
  list.innerHTML = html || `<li class="dropdown-empty">No contacts yet</li>`;
}

/**
 * Builds the HTML for one contact entry.
 * @param {Object} contact - The contact.
 * @returns {string} HTML string.
 */
function getContactItemHtml(contact) {
  let selected = selectedContacts.includes(contact.id) ? "selected" : "";
  return `
    <li class="dropdown-item ${selected}" onclick="toggleContact('${contact.id}')">
      <span class="avatar" style="background-color: ${contact.color}">${getInitials(contact.name)}</span>
      ${escapeHtml(contact.name)}
    </li>`;
}

/**
 * Returns the initials of a name.
 * @param {string} name - Full name.
 * @returns {string} Up to two uppercase letters.
 */
function getInitials(name) {
  let parts = name.trim().split(" ");
  let last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (parts[0][0] + last).toUpperCase();
}

/**
 * Adds or removes a contact from the selection.
 * @param {string} id - Contact ID.
 */
function toggleContact(id) {
  let index = selectedContacts.indexOf(id);
  if (index === -1) selectedContacts.push(id);
  else selectedContacts.splice(index, 1);
  renderAssignedList();
  renderAssignedAvatars();
}

/**
 * Shows avatars of all selected contacts below the dropdown.
 */
function renderAssignedAvatars() {
  let box = document.getElementById("assignedAvatars");
  let chosen = contacts.filter((c) => selectedContacts.includes(c.id));
  box.innerHTML = chosen
    .map(
      (c) =>
        `<span class="avatar" style="background-color: ${c.color}">${getInitials(c.name)}</span>`,
    )
    .join("");
}

/**
 * Closes both dropdowns when the user clicks outside of them.
 * @param {MouseEvent} event - The click event.
 */
function closeDropdownsOnOutsideClick(event) {
  if (event.target.closest(".dropdown")) return;
  document
    .querySelectorAll(".dropdown-list")
    .forEach((list) => (list.hidden = true));
}

/**
 * Adds a subtask when Enter is pressed. No main task is created.
 * @param {KeyboardEvent} event - The key event.
 */
function handleSubtaskKey(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addSubtask();
}

/**
 * Adds the text of the subtask input to the list.
 */
function addSubtask() {
  let input = document.getElementById("subtaskInput");
  let title = input.value.trim();
  if (!title) return;
  subtasks.push({ title: title, done: false });
  input.value = "";
  renderSubtasks();
}

/**
 * Clears the subtask input without adding anything.
 */
function clearSubtaskInput() {
  document.getElementById("subtaskInput").value = "";
}

/**
 * Renders the subtask list.
 */
function renderSubtasks() {
  let list = document.getElementById("subtaskList");
  list.innerHTML = subtasks.map(getSubtaskHtml).join("");
}

/**
 * Builds the HTML for one subtask (normal or edit mode).
 * @param {Object} subtask - The subtask.
 * @param {number} index - Position in the list.
 * @returns {string} HTML string.
 */
function getSubtaskHtml(subtask, index) {
  if (index === editingSubtask) return getSubtaskEditHtml(subtask, index);
  return `
    <li class="subtask-item">
      <span>&bull; ${escapeHtml(subtask.title)}</span>
      <span class="subtask-actions">
        <button type="button" aria-label="Edit subtask" onclick="editSubtask(${index})">&#9998;</button>
        <button type="button" aria-label="Delete subtask" onclick="deleteSubtask(${index})">&times;</button>
      </span>
    </li>`;
}

/**
 * Builds the HTML for a subtask in edit mode.
 * @param {Object} subtask - The subtask.
 * @param {number} index - Position in the list.
 * @returns {string} HTML string.
 */
function getSubtaskEditHtml(subtask, index) {
  return `
    <li class="subtask-item">
      <input id="subtaskEditInput" class="subtask-edit-input" type="text"
             value="${escapeHtml(subtask.title)}" onkeydown="handleSubtaskEditKey(event, ${index})">
      <span class="subtask-actions" style="display:flex">
        <button type="button" aria-label="Delete subtask" onclick="deleteSubtask(${index})">&times;</button>
        <button type="button" aria-label="Save subtask" onclick="saveSubtaskEdit(${index})">&#10003;</button>
      </span>
    </li>`;
}

/**
 * Switches a subtask to edit mode.
 * @param {number} index - Position in the list.
 */
function editSubtask(index) {
  editingSubtask = index;
  renderSubtasks();
  document.getElementById("subtaskEditInput").focus();
}

/**
 * Saves with Enter, cancels with Escape while editing a subtask.
 * @param {KeyboardEvent} event - The key event.
 * @param {number} index - Position in the list.
 */
function handleSubtaskEditKey(event, index) {
  if (event.key === "Enter") (event.preventDefault(), saveSubtaskEdit(index));
  if (event.key === "Escape") ((editingSubtask = -1), renderSubtasks());
}

/**
 * Saves the edited title. An empty title keeps the old one.
 * @param {number} index - Position in the list.
 */
function saveSubtaskEdit(index) {
  let title = document.getElementById("subtaskEditInput").value.trim();
  if (title) subtasks[index].title = title;
  editingSubtask = -1;
  renderSubtasks();
}

/**
 * Deletes a subtask.
 * @param {number} index - Position in the list.
 */
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  editingSubtask = -1;
  renderSubtasks();
}

/**
 * Shows an error below a field and marks the input.
 * @param {string} id - Base ID of the field.
 * @param {string} message - Error text.
 */
function showFieldError(id, message) {
  let input = document.getElementById(id);
  if (input) input.classList.add("error");
  document.getElementById(id + "Error").textContent = message;
}

/**
 * Removes the error of a field.
 * @param {string} id - Base ID of the field.
 */
function clearFieldError(id) {
  let input = document.getElementById(id);
  if (input) input.classList.remove("error");
  document.getElementById(id + "Error").textContent = "";
}

/**
 * Shows an error and returns false, for short validation code.
 * @param {string} id - Base ID of the field.
 * @param {string} message - Error text.
 * @returns {boolean} Always false.
 */
function failField(id, message) {
  showFieldError(id, message);
  return false;
}

/**
 * Checks the title. Spaces only count as empty.
 * @returns {boolean} True if valid.
 */
function validateTitle() {
  let value = document.getElementById("taskTitle").value.trim();
  return value ? true : failField("taskTitle", "This field is required");
}

/**
 * Parses "dd/mm/yyyy" into a Date or returns null.
 * @param {string} text - Input text.
 * @returns {Date|null} The date or null.
 */
function parseDate(text) {
  let match = text.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  let date = new Date(match[3], match[2] - 1, match[1]);
  let valid =
    date.getDate() === Number(match[1]) && date.getMonth() === match[2] - 1;
  return valid ? date : null;
}

/**
 * Checks the due date: required, valid and not in the past.
 * @returns {boolean} True if valid.
 */
function validateDueDate() {
  let text = document.getElementById("taskDueDate").value;
  let date = parseDate(text);
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!text.trim()) return failField("taskDueDate", "This field is required");
  if (!date) return failField("taskDueDate", "Use the format dd/mm/yyyy");
  if (date < today)
    return failField("taskDueDate", "Date must not be in the past");
  return true;
}

/**
 * Checks that a category is selected.
 * @returns {boolean} True if valid.
 */
function validateCategory() {
  if (selectedCategory) return true;
  return failField("taskCategory", "This field is required");
}

/**
 * Validates all required fields at once so every error is shown.
 * @returns {boolean} True if the whole form is valid.
 */
function validateTaskForm() {
  let results = [validateTitle(), validateDueDate(), validateCategory()];
  return results.every(Boolean);
}

/**
 * Collects all form values in one task object.
 * @returns {Object} The task.
 */
function collectTask() {
  return {
    title: document.getElementById("taskTitle").value.trim(),
    description: document.getElementById("taskDescription").value.trim(),
    dueDate: document.getElementById("taskDueDate").value.trim(),
    prio: selectedPrio,
    category: selectedCategory,
    assignedTo: selectedContacts,
    subtasks: subtasks,
    status: selectedStatus,
  };
}

/**
 * Validates and saves the task. The button is disabled while saving.
 */
async function createTask() {
  if (!validateTaskForm()) return;
  let button = document.getElementById("createTaskButton");
  button.disabled = true;
  await saveTask(collectTask());
  showToast("Task added to board");
  clearTaskForm();
  button.disabled = false;
  finishCreateTask();
}

/**
 * Board dialog: calls the callback. Page: goes to the board.
 */
function finishCreateTask() {
  if (onTaskCreated) return onTaskCreated();
  setTimeout(() => (window.location.href = "board.html"), 1200);
}

/**
 * Resets the form and all stored selections.
 */
function clearTaskForm() {
  resetState();
  ["taskTitle", "taskDescription", "taskDueDate", "subtaskInput"].forEach(
    (id) => {
      document.getElementById(id).value = "";
    },
  );
  ["taskTitle", "taskDueDate", "taskCategory"].forEach(clearFieldError);
  document.getElementById("categoryLabel").textContent = "Select task category";
  selectPrio("medium");
  renderSubtasks();
  renderAssignedList();
  renderAssignedAvatars();
}

/**
 * Shows a short message at the bottom of the screen.
 * @param {string} text - Message text.
 */
function showToast(text) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
