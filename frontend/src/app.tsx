import { useState } from "preact/hooks"
import { AdminPanel } from "./components/AdminPanel"
import "./app.css"

export const App = () => {
	const [showAdmin, setShowAdmin] = useState(false)

	return (
		<>
			<div className="app-container">
				<header className="app-header">
					<h1>Your Portfolio</h1>
					<button 
						onClick={() => setShowAdmin(true)} 
						className="admin-toggle"
						title="Open Admin Panel"
					>
						⚙️ Admin
					</button>
				</header>
				
				<main className="app-main">
					<div className="welcome-section">
						<h2>Welcome to Your Portfolio</h2>
						<p>This is your personal portfolio website. Use the admin panel to manage your content.</p>
						
						<div className="feature-grid">
							<div className="feature-card">
								<h3>📝 Blog Posts</h3>
								<p>Write and manage your blog posts</p>
							</div>
							<div className="feature-card">
								<h3>🐾 Pet Management</h3>
								<p>Manage your pet profiles and stats</p>
							</div>
							<div className="feature-card">
								<h3>💼 Projects</h3>
								<p>Showcase your projects and work</p>
							</div>
							<div className="feature-card">
								<h3>🎯 Skills & Experience</h3>
								<p>Keep your skills and experience up to date</p>
							</div>
						</div>
					</div>
				</main>
			</div>

			<AdminPanel 
				isVisible={showAdmin} 
				onClose={() => setShowAdmin(false)} 
			/>

			<style>{`
				.app-container {
					min-height: 100vh;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					color: white;
				}

				.app-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 20px;
					background: rgba(255, 255, 255, 0.1);
					backdrop-filter: blur(10px);
				}

				.app-header h1 {
					margin: 0;
					font-size: 2rem;
					font-weight: 300;
				}

				.admin-toggle {
					background: rgba(255, 255, 255, 0.2);
					border: 1px solid rgba(255, 255, 255, 0.3);
					color: white;
					padding: 10px 20px;
					border-radius: 25px;
					cursor: pointer;
					font-size: 16px;
					transition: all 0.3s ease;
				}

				.admin-toggle:hover {
					background: rgba(255, 255, 255, 0.3);
					transform: translateY(-2px);
				}

				.app-main {
					padding: 40px 20px;
					max-width: 1200px;
					margin: 0 auto;
				}

				.welcome-section {
					text-align: center;
					margin-bottom: 40px;
				}

				.welcome-section h2 {
					font-size: 3rem;
					margin-bottom: 20px;
					font-weight: 300;
				}

				.welcome-section p {
					font-size: 1.2rem;
					margin-bottom: 40px;
					opacity: 0.9;
				}

				.feature-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
					gap: 30px;
					margin-top: 40px;
				}

				.feature-card {
					background: rgba(255, 255, 255, 0.1);
					padding: 30px;
					border-radius: 15px;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255, 255, 255, 0.2);
					transition: all 0.3s ease;
				}

				.feature-card:hover {
					transform: translateY(-5px);
					background: rgba(255, 255, 255, 0.15);
				}

				.feature-card h3 {
					margin: 0 0 15px 0;
					font-size: 1.5rem;
					font-weight: 400;
				}

				.feature-card p {
					margin: 0;
					opacity: 0.9;
					line-height: 1.6;
				}

				@media (max-width: 768px) {
					.app-header h1 {
						font-size: 1.5rem;
					}

					.welcome-section h2 {
						font-size: 2rem;
					}

					.feature-grid {
						grid-template-columns: 1fr;
						gap: 20px;
					}
				}
			`}</style>
		</>
	)
}
