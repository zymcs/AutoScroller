chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script initialized");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle") {
    chrome.storage.sync.set({ isEnabled: message.isEnabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        injectContentScript(tabs[0].id, message.isEnabled);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "No active tab found" });
      }
    });

    return true; // Indicates asynchronous response
  }
});

function injectContentScript(tabId, isEnabled) {
  chrome.scripting.executeScript(
    {
      target: { tabId },
      func: () => {
        if (typeof window.autoScrollInitialized !== "undefined" && window.autoScrollInitialized) {
          console.log("Content script already initialized");
          return;
        }
        window.autoScrollInitialized = true;
      }
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error during script initialization:", chrome.runtime.lastError.message);
        return;
      }

      chrome.scripting.executeScript(
        { target: { tabId }, files: ["content/content.js"] },
        (result) => {
          if (chrome.runtime.lastError) {
            console.error("Error injecting content script:", chrome.runtime.lastError.message);
          } else {
            console.log("Content script injected successfully");
            chrome.tabs.sendMessage(tabId, {
              action: "toggleAutoScroll",
              enabled: isEnabled
            });
          }
        }
      );
    }
  );
}
