import { useState, useEffect, useRef } from "preact/hooks";
import { BlogManager } from "./managers/BlogManager";
import { PetManager } from "./managers/PetManager";
import { DataManager } from "./managers/DataManager";
import { TagManager } from "./managers/TagManager";
import { CommentManager } from "./managers/CommentManager";
import { AdminPanelProps } from "../../types/admin-panel.types";
import { Section } from "../../types/admin-panel.types";
import { TestimonialInvitesManager } from "./managers/TestimonialInvitesManager";

console.log("AdminPanel rendered");

const API_URL = import.meta.env.VITE_API_URL;

export const AdminPanel = ({ isVisible, onClose }: AdminPanelProps) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [activeSection, setActiveSection] = useState<Section>("blog");
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
			} else setError("Invalid password");
		} catch (err) {
			setError("Login failed");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("adminToken");
		setIsAuthenticated(false);
		setPassword("");
	};

	const handleFocus = () => setLastFocusTime(Date.now());

	useEffect(() => {
		const token = localStorage.getItem("adminToken");
		if (!token) return;

		fetch(`${API_URL}/api/admin/verify`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => {
				if (res.ok) setIsAuthenticated(true);
				else {
					localStorage.removeItem("adminToken");
					setIsAuthenticated(false);
				}
			})
			.catch(() => {
				localStorage.removeItem("adminToken");
				setIsAuthenticated(false);
			});
	}, []);

	useEffect(() => {
		if (isVisible && panelRef.current) panelRef.current.focus();
	}, [isVisible]);

	if (!isVisible) return null;

	return (
		<>
			<div
				data-bs-backdrop="static"
				className="modal fade show d-block"
				style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
				onClick={onClose}
			>
				<div
					className="modal-dialog modal-xl modal-dialog-centered"
					ref={panelRef}
					data-bs-backdrop="static"
					onClick={e => e.stopPropagation()}
					onFocus={handleFocus}
					tabIndex={-1}
					style={{ height: "100vh", maxHeight: "100vh" }}
				>
					<div className="modal-content h-100 admin-modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Admin Panel</h5>
							<button type="button" className="btn-close" onClick={onClose}></button>
						</div>

						{!isAuthenticated ? (
							<div className="modal-body text-center p-5">
								<h3 className="mb-4">Admin Login</h3>
								<div className="row justify-content-center">
									<div className="col-md-6">
										<input
											type="password"
											className="form-control mb-3"
											placeholder="Enter admin password"
											value={password}
											onChange={e => setPassword((e.target as HTMLInputElement).value)}
											onKeyPress={e => e.key === "Enter" && handleLogin()}
										/>
										<button onClick={handleLogin} className="btn btn-primary">
											Login
										</button>
										{error && <div className="alert alert-danger mt-3">{error}</div>}
									</div>
								</div>
							</div>
						) : (
							<div className="modal-body p-0 admin-modal-body-flex">
								<div className="col-md-3 border-end admin-modal-sidebar" style={{ minWidth: 220 }}>
									<div className="nav flex-column nav-pills h-100">
										<button
											className={`nav-link ${activeSection === "blog" ? "active" : ""}`}
											onClick={() => setActiveSection("blog")}
										>
											Blog Posts
										</button>
										<button
											className={`nav-link ${activeSection === "pets" ? "active" : ""}`}
											onClick={() => setActiveSection("pets")}
										>
											Pets
										</button>
										<button
											className={`nav-link ${activeSection === "projects" ? "active" : ""}`}
											onClick={() => setActiveSection("projects")}
										>
											Projects
										</button>
										<button
											className={`nav-link ${activeSection === "skills" ? "active" : ""}`}
											onClick={() => setActiveSection("skills")}
										>
											Skills
										</button>
										<button
											className={`nav-link ${activeSection === "experience" ? "active" : ""}`}
											onClick={() => setActiveSection("experience")}
										>
											Experience
										</button>
										<button
											className={`nav-link ${activeSection === "testimonials" ? "active" : ""}`}
											onClick={() => setActiveSection("testimonials")}
										>
											Testimonials
										</button>
										<button
											className={`nav-link ${activeSection === "certifications" ? "active" : ""}`}
											onClick={() => setActiveSection("certifications")}
										>
											Certifications
										</button>
										<button
											className={`nav-link ${activeSection === "testimonial-invites" ? "active" : ""}`}
											onClick={() => setActiveSection("testimonial-invites")}
										>
											Testimonial Invites
										</button>
										<button
											className={`nav-link ${activeSection === "tags" ? "active" : ""}`}
											onClick={() => setActiveSection("tags")}
										>
											Tags
										</button>
										<button
											className={`nav-link ${activeSection === "comments" ? "active" : ""}`}
											onClick={() => setActiveSection("comments")}
										>
											Comments
										</button>
										<div className="mt-auto p-3">
											<button onClick={handleLogout} className="btn btn-outline-danger w-100">
												Logout
											</button>
										</div>
									</div>
								</div>
								<div className="col-md-9 p-3 admin-modal-main">
									{activeSection === "blog" && <BlogManager />}
									{activeSection === "pets" && <PetManager />}
									{["projects", "skills", "experience", "testimonials", "certifications"].includes(activeSection) && (
										<DataManager lastFocusTime={lastFocusTime} initialTab={activeSection as any} />
									)}
									{activeSection === "testimonial-invites" && <TestimonialInvitesManager />}
									{activeSection === "tags" && <TagManager />}
									{activeSection === "comments" && <CommentManager />}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
};
