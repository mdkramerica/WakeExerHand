import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Function to remove development widgets
const removeDevelopmentWidgets = () => {
  // Remove any fixed positioned elements that could be development widgets
  const fixedElements = document.querySelectorAll('div[style*="position: fixed"], iframe[style*="position: fixed"]');
  fixedElements.forEach((element) => {
    const style = (element as HTMLElement).style;
    const computedStyle = window.getComputedStyle(element);
    
    // Check if it's likely a development widget (in corners, small size, blue color, etc.)
    const isInCorner = style.bottom || style.right || computedStyle.bottom !== 'auto' || computedStyle.right !== 'auto';
    const isSmall = element.clientWidth < 200 && element.clientHeight < 200;
    const hasBlueBackground = style.backgroundColor?.includes('rgb(59, 130, 246)') || 
                              style.backgroundColor?.includes('#3b82f6') ||
                              computedStyle.backgroundColor?.includes('rgb(59, 130, 246)');
    
    // Don't remove legitimate UI elements like toasts
    const isLegitimate = element.classList.contains('toast') || 
                        element.getAttribute('role') === 'alert' ||
                        element.getAttribute('aria-live') ||
                        element.id?.includes('toast');
    
    if ((isInCorner || isSmall || hasBlueBackground) && !isLegitimate) {
      element.remove();
    }
  });
};

// Run immediately and set up observers
removeDevelopmentWidgets();

// Set up mutation observer to catch dynamically added widgets
const observer = new MutationObserver(() => {
  removeDevelopmentWidgets();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Also run periodically as a backup
setInterval(removeDevelopmentWidgets, 1000);

createRoot(document.getElementById("root")!).render(<App />);
