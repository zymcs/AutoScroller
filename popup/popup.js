document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("toggleButton");

  chrome.storage.sync.get(["isEnabled"], (result) => {
    const isEnabled = result.isEnabled || false;
    updateButton(isEnabled);
  });

  button.addEventListener("click", () => {
    chrome.storage.sync.get(["isEnabled"], (result) => {
      const isEnabled = !result.isEnabled; // Toggle the state
      chrome.storage.sync.set({ isEnabled }); // Save the new state

      chrome.runtime.sendMessage(
        { action: "toggle", isEnabled },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message to background script:", chrome.runtime.lastError.message);
          } else if (response?.success) {
            console.log("Message processed by background script successfully");
            updateButton(isEnabled);
          } else {
            console.error("Background script reported an error:", response?.error || "Unknown error");
          }
        }
      );
    });
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.isEnabled) {
      const isEnabled = changes.isEnabled.newValue;
      updateButton(isEnabled);
    }
  });
});

function updateButton(isEnabled) {
  const button = document.getElementById("toggleButton");
  if (isEnabled) {
    button.textContent = "Disable AutoScroll";
    button.classList.remove("disabled");
    button.classList.add("enabled");
  } else {
    button.textContent = "Enable AutoScroll";
    button.classList.remove("enabled");
    button.classList.add("disabled");
  }
}
