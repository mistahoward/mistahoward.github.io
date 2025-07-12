import { useState, useEffect, useRef } from "preact/hooks";
import { BlogEditor } from "./admin/BlogEditor";
import { PetManager } from "./admin/PetManager";
import { DataManager } from "./admin/DataManager";

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

      <style>{`
        .admin-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .admin-panel {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 1200px;
          height: 90%;
          max-height: 800px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .admin-header h2 {
          margin: 0;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #333;
        }

        .login-section {
          padding: 40px;
          text-align: center;
        }

        .login-section h3 {
          margin-bottom: 20px;
          color: #333;
        }

        .login-section input {
          width: 100%;
          max-width: 300px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 16px;
        }

        .login-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .login-btn:hover {
          background: #0056b3;
        }

        .error {
          color: #dc3545;
          margin-top: 10px;
        }

        .admin-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .admin-nav {
          width: 200px;
          background: #f8f9fa;
          border-right: 1px solid #eee;
          padding: 20px 0;
        }

        .admin-nav button {
          width: 100%;
          padding: 12px 20px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #666;
          transition: all 0.2s;
        }

        .admin-nav button:hover {
          background: #e9ecef;
          color: #333;
        }

        .admin-nav button.active {
          background: #007bff;
          color: white;
        }

        .logout-btn {
          margin-top: 20px;
          color: #dc3545 !important;
        }

        .logout-btn:hover {
          background: #dc3545 !important;
          color: white !important;
        }

        .admin-section {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .admin-component {
          display: block;
        }

        .admin-component.hidden {
          display: none;
        }
      `}</style>
    </div>
  );
} 