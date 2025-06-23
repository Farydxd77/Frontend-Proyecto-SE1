import { useState } from 'react'
import { AppRouter } from './Router/AppRouter'
import { AuthProvider } from './auth/AuthContext'
import './index.css' // ← Esta línea es importante
function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
      <AppRouter/>
    </AuthProvider>
    
  )
}

export default App
