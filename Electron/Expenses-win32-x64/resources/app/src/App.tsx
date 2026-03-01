import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import IngresosPage from './pages/IngresosPage';
import PresupuestosPage from './pages/PresupuestosPage';
import ReportsPage from './pages/ReportsPage';
import CategoriasPage from './pages/CategoriasPage';
import CuentasPage from './pages/CuentasPage';
import MainLayout from './layouts/MainLayout';
import SidebarMenu from './components/SidebarMenu';
import PrivateRoute from './components/PrivateRoute';

function AuthenticatedApp() {
  const [page, setPage] = useState("dashboard");

  function renderContent() {
    switch (page) {
      case "dashboard":
        return <DashboardPage />;
      case "expenses":
        return <ExpensesPage />;
      case "incomes":
        return <IngresosPage />;
      case "budgets":
        return <PresupuestosPage />;
      case "reports":
        return <ReportsPage />;
      case "categories":
        return <CategoriasPage />;
      case "accounts":
        return <CuentasPage />;
      default:
        return <DashboardPage />;
    }
  }

  return (
    <MainLayout
      sidebar={<SidebarMenu current={page} onChange={setPage} />}
      content={renderContent()}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<AuthenticatedApp />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
