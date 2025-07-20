import { useEffect, useState } from "preact/hooks";
import { showDeleteConfirm } from "../../../utils/sweetalert";

const API_URL = import.meta.env.VITE_API_URL || "";

export const TestimonialInvitesManager = () => {
	const [invites, setInvites] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState({ name: "", expiresAt: "" });
	const [creating, setCreating] = useState(false);
	const [copied, setCopied] = useState<string | null>(null);
	const [newLink, setNewLink] = useState<string | null>(null);

	const fetchInvites = async () => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("adminToken");
			const res = await fetch(`${API_URL}/api/admin/testimonial-invites`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			const invitesArr = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
			console.log("Fetched invites:", invitesArr);
			setInvites(invitesArr);
			if (!res.ok) setError(data?.error || "Failed to fetch invites");
		} catch {
			setError("Failed to fetch invites");
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchInvites();
	}, []);

	const handleChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		setForm(f => ({ ...f, [target.name]: target.value }));
	};

	const handleCreate = async (e: Event) => {
		e.preventDefault();
		setCreating(true);
		setError("");
		setNewLink(null);
		try {
			const token = localStorage.getItem("adminToken");
			const res = await fetch(`${API_URL}/api/admin/testimonial-invites`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			console.log("Invite create response:", data);
			if (res.ok) {
				const tokenValue = data?.data?.token || data?.token;
				await fetchInvites();
				setForm({ name: "", expiresAt: "" });
				if (tokenValue) {
					const url = `${window.location.origin}/testimonials/submit?token=${tokenValue}`;
					setNewLink(url);
				} else {
					setError("Invite created but no token returned. Please check the backend response.");
				}
			} else setError(data?.error || "Failed to create invite");
		} catch (err) {
			setError("Failed to create invite");
		}
		setCreating(false);
	};

	const handleDelete = async (id: number) => {
		const result = await showDeleteConfirm("this invite");
		if (!result.isConfirmed) return;

		setError("");
		try {
			const token = localStorage.getItem("adminToken");
			const res = await fetch(`${API_URL}/api/admin/testimonial-invites/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();
			if (res.ok) fetchInvites();
			else setError(data?.error || "Failed to delete invite");
		} catch {
			setError("Failed to delete invite");
		}
	};

	const handleCopy = (token: string) => {
		const url = `${window.location.origin}/testimonials/submit?token=${token}`;
		navigator.clipboard.writeText(url);
		setCopied(token);
		setTimeout(() => setCopied(null), 2000);
	};

	console.log("Rendering invites:", invites);

	return (
		<div className="container" style={{ maxWidth: "48rem", margin: "2rem auto" }}>
			<h3 className="mb-4">Testimonial Invites</h3>
			{error && <div className="alert alert-danger">{error}</div>}
			{newLink && (
				<div className="alert alert-success alert-dismissible fade show" role="alert" style={{ fontSize: "1rem" }}>
					<strong>Invite Link:</strong> <span style={{ fontFamily: "monospace" }}>{newLink}</span>
					<button
						type="button"
						className="btn-close"
						aria-label="Close"
						onClick={() => setNewLink(null)}
						style={{ float: "right" }}
					></button>
				</div>
			)}
			<form className="card p-3 mb-4" onSubmit={handleCreate} style={{ gap: "1rem" }}>
				<div className="row g-3 align-items-end" style={{ marginBottom: "0.5rem" }}>
					<div className="col-md-7">
						<label className="form-label">Name</label>
						<input type="text" className="form-control" name="name" value={form.name} onInput={handleChange} required />
					</div>
					<div className="col-md-3">
						<label className="form-label">Expiry (optional)</label>
						<input type="date" className="form-control" name="expiresAt" value={form.expiresAt} onInput={handleChange} />
					</div>
					<div className="col-md-2 d-grid" style={{ alignSelf: "end" }}>
						<button type="submit" className="btn btn-primary" disabled={creating} style={{ minWidth: "6rem" }}>
							{creating ? "Creating..." : "Create"}
						</button>
					</div>
				</div>
			</form>
			{loading ? (
				<div>Loading...</div>
			) : (
				<table className="table table-bordered table-hover">
					<thead>
						<tr>
							<th>Name</th>
							<th>Token</th>
							<th>Used</th>
							<th>Created</th>
							<th>Used At</th>
							<th>Expires</th>
							<th>Link</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{invites.length === 0 && (
							<tr>
								<td colSpan={8} className="text-center text-muted">
									No invites found.
								</td>
							</tr>
						)}
						{invites.map(invite => (
							<tr key={invite.id} className={invite.used ? "table-success" : ""}>
								<td>{invite.name}</td>
								<td style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{invite.token}</td>
								<td>{invite.used ? "Yes" : "No"}</td>
								<td>{invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : ""}</td>
								<td>{invite.usedAt ? new Date(invite.usedAt).toLocaleDateString() : ""}</td>
								<td>{invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : ""}</td>
								<td>
									<button className="btn btn-outline-secondary btn-sm" onClick={() => handleCopy(invite.token)}>
										{copied === invite.token ? "Copied!" : "Copy Link"}
									</button>
								</td>
								<td>
									<button className="btn btn-danger btn-sm" onClick={() => handleDelete(invite.id)}>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
};
