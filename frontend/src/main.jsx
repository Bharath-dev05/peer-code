import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppSidebar from './components/ui/app-sidebar.jsx'
// import { sidebarProvider } from './context/sidebar-context.jsx'

createRoot(document.getElementById('root')).render(
 
    < sidebarProvider>
      
      <App />
    </ sidebarProvider>
    

)
