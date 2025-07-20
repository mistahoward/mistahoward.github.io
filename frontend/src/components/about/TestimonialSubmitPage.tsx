import { useState, useEffect } from "preact/hooks";
import { API_URL } from "../../utils/api";

function getTokenFromUrl() {
	const params = new URLSearchParams(window.location.search);
	return params.get("token") || "";
}

export const TestimonialSubmitPage = () => {
	console.log("TestimonialSubmitPage mounted");
	const [form, setForm] = useState({
		name: "",
		title: "",
		company: "",
		content: "",
		relationship: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const [token, setToken] = useState("");
	const [tokenValid, setTokenValid] = useState(false);
	const [tokenChecked, setTokenChecked] = useState(false);

	useEffect(() => {
		const t = getTokenFromUrl();
		console.log("Running token validation useEffect", t);
		setToken(t);
		if (!t) {
			setError("Missing or invalid invite token. Please use your unique link.");
			setTokenChecked(true);
			return;
		}
		// Validate token with new public endpoint
		fetch(`${API_URL}/api/testimonials/validate-token?token=${encodeURIComponent(t)}`)
			.then(res => res.json())
			.then(data => {
				console.log("Token validation response:", data);
				if (!data.valid) setError(data.reason || "Invalid or expired invite token.");
				else setTokenValid(true);
				setTokenChecked(true);
			})
			.catch(err => {
				console.error("Token validation error:", err);
				setError("Failed to validate invite token.");
				setTokenChecked(true);
			});
	}, []);

	const handleChange = (e: Event) => {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		setForm(f => ({ ...f, [target.name]: target.value }));
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setSubmitting(true);
		setSuccess("");
		setError("");
		try {
			const res = await fetch(`${API_URL}/api/testimonials`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					clientName: form.name,
					clientTitle: form.title,
					clientCompany: form.company,
					content: form.content,
					relationship: form.relationship,
					token,
				}),
			});
			if (res.ok) {
				setSuccess("Thank you! Your testimonial has been submitted for review.");
				setForm({ name: "", title: "", company: "", content: "", relationship: "" });
				setTimeout(() => {
					window.location.assign("/");
				}, 2000);
			} else {
				const data = await res.json();
				setError(data?.error || "Submission failed.");
			}
		} catch {
			setError("Submission failed. Please try again later.");
		}
		setSubmitting(false);
	};

	if (!tokenChecked)
		return (
			<div className="container" style={{ maxWidth: "40rem", margin: "5rem auto 2rem auto" }}>
				Validating invite link...
			</div>
		);

	if (!tokenValid) {
		console.error("Testimonial invite error:", error);
		return (
			<div className="container" style={{ maxWidth: "40rem", margin: "5rem auto 2rem auto" }}>
				<div className="alert alert-danger mt-5" style={{ marginTop: "5rem" }}>
					{error || "This invite link is invalid, expired, or already used. Please contact the site owner for a new link."}
				</div>
			</div>
		);
	}

	return (
		<div className="container" style={{ maxWidth: "60rem", margin: "5rem auto 2rem auto" }}>
			<div className="row g-4 align-items-center">
				<div
					className="col-md-6 d-flex flex-column align-items-start justify-content-center"
					style={{ minHeight: "28rem", padding: "2rem 1rem" }}
				>
					<h2 className="mb-3" style={{ fontWeight: 700, fontSize: "2.2rem" }}>
						Hi!
					</h2>
					<p className="lead mb-4" style={{ fontSize: "1.2rem" }}>
						Alex likes you enough that he wants to hear your thoughts about working with him. Please fill out the form to leave
						your testimonial.
					</p>
					<ul className="list-unstyled text-muted small" style={{ fontSize: "1rem" }}>
						<li>• Your testimonial may be featured on Alex&apos;s site.</li>
						<li>• Only your name, title, and company will be shown publicly.</li>
						<li>• Thank you for your time!</li>
					</ul>
				</div>
				<div className="col-md-6">
					<div className="card p-4 shadow-sm">
						<h3 className="mb-3">Submit a Testimonial</h3>
						{success && (
							<div className="alert alert-success" style={{ marginTop: "1.5rem" }}>
								{success}
							</div>
						)}
						{error && (
							<div className="alert alert-danger" style={{ marginTop: "1.5rem" }}>
								{error}
							</div>
						)}
						<form onSubmit={handleSubmit}>
							<div className="mb-3">
								<label className="form-label">First and Last Name *</label>
								<input type="text" className="form-control" name="name" value={form.name} onInput={handleChange} required />
							</div>
							<div className="mb-3">
								<label className="form-label">Job Title or Role</label>
								<input type="text" className="form-control" name="title" value={form.title} onInput={handleChange} />
							</div>
							<div className="mb-3">
								<label className="form-label">Company or Organization</label>
								<input type="text" className="form-control" name="company" value={form.company} onInput={handleChange} />
							</div>
							<div className="mb-3">
								<label className="form-label">How do you know Alex? *</label>
								<input
									type="text"
									className="form-control"
									name="relationship"
									value={form.relationship}
									onInput={handleChange}
									required
								/>
							</div>
							<div className="mb-3">
								<label className="form-label">Testimonial *</label>
								<textarea
									className="form-control"
									name="content"
									value={form.content}
									onInput={handleChange}
									rows={4}
									required
								/>
							</div>

							<button
								type="submit"
								className="btn btn-primary w-100"
								disabled={submitting}
								style={{ minHeight: "2.5rem", fontSize: "1.1rem" }}
							>
								{submitting ? "Submitting..." : "Submit"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
