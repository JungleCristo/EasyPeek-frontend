import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext' // 保留主题提供者导入
import router from './routes'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App