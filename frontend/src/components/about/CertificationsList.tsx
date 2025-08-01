import { useState, useEffect } from "preact/hooks";
import { Certification } from "../../types/data-manager.types";
import { fetchItems } from "../../utils/crud";
import { LoadingSpinner, formatDate } from "../../utils/ui";

export const CertificationsList = () => {
	const [certifications, setCertifications] = useState<Certification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadCertifications = async () => {
			try {
				const data = await fetchItems({ endpoint: "/api/certifications", setError });
				if (data) setCertifications(data as Certification[]);
			} catch (err) {
				setError("Failed to load certifications");
			} finally {
				setLoading(false);
			}
		};

		loadCertifications();
	}, []);

	if (loading)
		return (
			<div className="tab-scroll-area d-flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
				<LoadingSpinner />
			</div>
		);

	if (error) return <div className="text-danger">{error}</div>;

	if (certifications.length === 0) return <div>No certifications found.</div>;

	return (
		<div className="tab-scroll-area">
			<div className="row g-3">
				{certifications.map(cert => (
					<div key={cert.id} className="col-md-6 col-lg-4">
						<div className="card h-100 certification-card">
							{cert.imageUrl && (
								<div className="text-center p-3">
									<img
										src={cert.imageUrl}
										alt={`${cert.name} badge`}
										className="img-fluid"
										style={{ maxHeight: "80px", maxWidth: "120px" }}
									/>
								</div>
							)}
							<div className="card-body">
								<h5 className="card-title h6 mb-2">{cert.name}</h5>
								<p className="card-text small text-muted mb-2">
									<strong>Issuer:</strong> {cert.issuer}
								</p>
								<p className="card-text small text-muted mb-2">
									<strong>Issued:</strong> {formatDate(cert.issueDate)}
									{cert.expiryDate && (
										<>
											<br />
											<strong>Expires:</strong> {formatDate(cert.expiryDate)}
										</>
									)}
								</p>
								{cert.description && <p className="card-text small mb-2">{cert.description}</p>}
								{cert.credentialUrl && (
									<a
										href={cert.credentialUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="btn btn-outline-primary btn-sm"
									>
										Verify Credential
									</a>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
