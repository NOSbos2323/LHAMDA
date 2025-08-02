import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import CarDetailView from "./components/CarDetailView";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import routes from "tempo-routes";

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    setIsAdminLoggedIn(adminLoggedIn);
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setShowAdminLogin(false);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsAdminLoggedIn(false);
  };

  const AdminRoute = () => {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLogin}
          onCancel={() => window.history.back()}
        />
      );
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  };

  const AdminLoginRoute = () => {
    if (isAdminLoggedIn) {
      return <AdminDashboard onLogout={handleAdminLogout} />;
    }
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLogin}
        onCancel={() => window.history.back()}
      />
    );
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/car/:id" element={<CarDetailView />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/admin-login" element={<AdminLoginRoute />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
