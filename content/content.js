if (typeof window.autoScrollInitialized === "undefined") {
  window.autoScrollInitialized = false;
  window.autoScrollEnabled = false;
  window.scrollInterval = null;
}

if (!window.autoScrollInitialized) {
  window.autoScrollInitialized = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleAutoScroll") {
      window.autoScrollEnabled = message.enabled;

      if (window.autoScrollEnabled) {
        console.log("AutoScroll enabled");
        startAutoScroll();
      } else {
        console.log("AutoScroll disabled");
        stopAutoScroll();
      }
    }
  });

  function startAutoScroll() {
    if (window.scrollInterval) clearInterval(window.scrollInterval);

    window.scrollInterval = setInterval(() => {
      if (!window.autoScrollEnabled) {
        clearInterval(window.scrollInterval);
        window.scrollInterval = null;
        return;
      }

      if (window.location.href.includes("/reels/")) {
        const video = document.querySelector("video");
        if (video && video.duration && video.currentTime >= video.duration - 0.5) {
          const nextButton = document.querySelector("[aria-label='Next']");
          if (nextButton) {
            console.log("Clicking 'Next' button");
            nextButton.click();
          } else {
            console.log("Scrolling down as fallback");
            simulateSwipeDown();
          }
        }
      }
    }, 1000);
  }

  function simulateSwipeDown() {
    const reelContainer = document.querySelector('[role="presentation"]');
    if (reelContainer) {
      reelContainer.scrollBy(0, window.innerHeight);
      console.log("Scrolled within reel container");
    } else {
      window.scrollBy(0, window.innerHeight);
      console.log("Scrolled the whole page");
    }
  }

  function stopAutoScroll() {
    if (window.scrollInterval) {
      console.log("Clearing scroll interval");
      clearInterval(window.scrollInterval);
      window.scrollInterval = null;
    }
  }
}
