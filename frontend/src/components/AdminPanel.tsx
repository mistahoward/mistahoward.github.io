import { useState, useEffect, useRef } from "preact/hooks";
import { BlogEditor } from "./admin/BlogEditor";
import { PetManager } from "./admin/PetManager";
import { DataManager } from "./admin/DataManager";
import "./AdminPanel.scss";

const API_URL = import.meta.env.VITE_API_URL;

interface AdminPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AdminPanel({ isVisible, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<"blog" | "pets" | "data">("blog");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lastFocusTime, setLastFocusTime] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem("adminToken", token);
        setIsAuthenticated(true);
        setError("");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setPassword("");
  };

  const handleFocus = () => {
    setLastFocusTime(Date.now());
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="admin-panel-overlay" onClick={onClose}>
      <div 
        className="admin-panel" 
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        onFocus={handleFocus}
        tabIndex={-1}
      >
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {!isAuthenticated ? (
          <div className="login-section">
            <h3>Admin Login</h3>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <button onClick={handleLogin} className="login-btn">
              Login
            </button>
            {error && <div className="error">{error}</div>}
          </div>
        ) : (
          <div className="admin-content">
            <div className="admin-nav">
              <button
                className={activeSection === "blog" ? "active" : ""}
                onClick={() => setActiveSection("blog")}
              >
                Blog Posts
              </button>
              <button
                className={activeSection === "pets" ? "active" : ""}
                onClick={() => setActiveSection("pets")}
              >
                Pets
              </button>
              <button
                className={activeSection === "data" ? "active" : ""}
                onClick={() => setActiveSection("data")}
              >
                Other Data
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>

            <div className="admin-section">
              {activeSection === "blog" && <BlogEditor lastFocusTime={lastFocusTime} />}
              {activeSection === "pets" && <PetManager lastFocusTime={lastFocusTime} />}
              {activeSection === "data" && <DataManager lastFocusTime={lastFocusTime} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 