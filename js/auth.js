// js/auth.js
import { CLERK_PUBLISHABLE_KEY } from './config.js';

let clerk = null;

export async function initAuth() {
  if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY.includes("YOUR_")) {
    console.error("⚠️ Please update your Clerk Publishable Key in js/config.js");
    return;
  }

  // Check if Clerk script is already appended to prevent duplicates
  if (window.Clerk) {
    setupClerkInstance(window.Clerk);
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = "https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js";
  
  script.onload = () => {
    if (window.Clerk) {
      setupClerkInstance(window.Clerk);
    } else {
      console.error("Failed to find window.Clerk after script load.");
    }
  };

  script.onerror = () => {
    console.error("Failed to load Clerk script from CDN. Check your network connection.");
  };

  document.head.appendChild(script);
}

async function setupClerkInstance(ClerkObj) {
  try {
    clerk = ClerkObj;
    
    // Initialize Clerk with your Publishable Key
    await clerk.load({ publishableKey: CLERK_PUBLISHABLE_KEY });
    console.log("✅ Clerk initialized successfully!");

    // Set up initial UI state
    updateAuthUI();

    // Listen to user session changes (sign in / sign out)
    clerk.addListener(({ user }) => {
      updateAuthUI(user);
    });
  } catch (error) {
    console.error("❌ Error loading Clerk instance:", error);
  }
}

function updateAuthUI(user = clerk?.user) {
  const authBtn = document.getElementById('auth-btn');
  if (!authBtn) return;

  if (user) {
    // Authenticated state: Turn button into a Dashboard link
    const displayName = user.firstName || user.emailAddresses?.[0]?.emailAddress || "Account";
    authBtn.textContent = `Dashboard (${displayName})`;
    authBtn.onclick = () => {
      window.location.href = 'dashboard.html';
    };
  } else {
    // Unauthenticated state: Open Clerk Sign-In Modal
    authBtn.textContent = "Login / Sign Up";
    authBtn.onclick = async () => {
      if (!clerk) {
        alert("Authentication is still initializing. Please try again in a moment.");
        return;
      }
      try {
        await clerk.openSignIn({
          afterSignInUrl: 'dashboard.html',
          afterSignUpUrl: 'dashboard.html'
        });
      } catch (err) {
        console.error("Failed to open sign-in modal:", err);
      }
    };
  }
}

// Auto-run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initAuth);