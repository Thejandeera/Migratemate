import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "@asgardeo/auth-react"
import './index.css'
import App from './App.jsx'

// ⚠️ IMPORTANT: Replace these with your actual Asgardeo details
// You can find these in the Asgardeo Console -> Applications -> MigrateMate-Frontend
const authConfig = {
  signInRedirectURL: "http://localhost:5173", // Change this to http://localhost:3000 if using CRA/npm start
  signOutRedirectURL: "http://localhost:5173",
  clientID: "iZzkF8xNjYqLISFUgrPp2z_dtSsa", // Paste your Client ID from Asgardeo Console
  baseUrl: "https://api.asgardeo.io/t/thejandeera", // e.g., https://api.asgardeo.io/t/thejandeera
  scope: ["openid", "profile", "email"]
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider config={authConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)