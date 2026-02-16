import { BrowserRouter } from 'react-router-dom'
import { DecisionProvider } from './hooks/useDecisions'
import AppRoutes from './routes/AppRoutes'
import Layout from './layouts/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <DecisionProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </DecisionProvider>
    </BrowserRouter>
  )
}
