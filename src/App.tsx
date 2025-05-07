
import { Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import StorePage from "./pages/StorePage";
import { seedProducts } from './firebase';

function App() {
  const userType = "admin"; // mockado: "admin" ou "user"

  
  return (
    <Routes>
      <Route path="/" element={<Navigate to={userType === 'admin' ? '/admin' : '/store'} />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/store" element={<StorePage />} />
    </Routes>
  );
}

export default App;
