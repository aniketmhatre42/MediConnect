import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// Ensure no Firebase initialization happens at the global scope
// This helps prevent TDZ errors that might originate from module initialization

// Add error boundary for React 17
const rootElement = document.getElementById("root");

try {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement
  );
} catch (error) {
  console.error("Error rendering application:", error);
  // Display a fallback UI
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2>Something went wrong</h2>
      <p>The application couldn't be loaded properly. Please try refreshing the page.</p>
      <button onclick="window.location.reload()">Refresh</button>
    </div>
  `;
}