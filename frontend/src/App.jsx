import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useModule } from "./context/ModuleContext";
import LoginPage from "./pages/LoginPage";
import ModulesPage from "./pages/ModulesPage";
import DashboardPage from "./pages/DashboardPage";

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        Chargement...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}


function ModuleRoute({ children }) {
  const { selectedModule, isLoading } = useModule();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        Chargement...
      </div>
    );
  }

  return selectedModule ? children : <Navigate to="/modules" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/modules"
        element={
          <PrivateRoute>
            <ModulesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <ModuleRoute>
              <DashboardPage />
            </ModuleRoute>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
