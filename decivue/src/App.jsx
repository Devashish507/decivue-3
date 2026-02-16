import { BrowserRouter } from 'react-router-dom'
import { DecisionProvider } from './hooks/useDecisions'
import { LayoutProvider } from './contexts/LayoutContext'
import AppRoutes from './routes/AppRoutes'
import Layout from './layouts/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <DecisionProvider>
        <LayoutProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </LayoutProvider>
      </DecisionProvider>
    </BrowserRouter>
  )
}
