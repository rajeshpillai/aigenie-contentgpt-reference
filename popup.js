const newContainer = document.getElementById("new-container");
const updateContainer = document.getElementById("update-container");

const apiKeyInput = document.getElementById("api-key-input");
const updateButton = document.getElementById("update-button");
const addButton = document.getElementById("add-button");

chrome.storage.local.get("apiKey", (data) => {
  if (data.apiKey) {
    // API key exists in local storage
    newContainer.classList.add("hidden"); // hide NEW-Form
    updateContainer.classList.remove("hidden"); // show UPDATE-Form
  }
});

// Save API key to local storage
addButton.addEventListener("click", () => {
  // Encode the API key to Base64
  const base64ApiKey = btoa(apiKeyInput.value);

  // stored API Key in extension storage
  chrome.storage.local.set({ apiKey: base64ApiKey }, function () {
    newContainer.classList.add("hidden"); // hide NEW-Form
    updateContainer.classList.remove("hidden"); // show UPDATE-Form
  });
});

// Update the API key
updateButton.addEventListener("click", () => {
  // remove API Key from extension storage
  chrome.storage.local.remove("apiKey", () => {
    updateContainer.classList.add("hidden"); // hide UPDATE-Form
    newContainer.classList.remove("hidden"); // show NEW-Form
  });
});

