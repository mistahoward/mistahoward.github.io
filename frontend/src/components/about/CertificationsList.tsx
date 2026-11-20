import { useState, useEffect } from "preact/hooks";
import { FaExternalLinkAlt } from "react-icons/fa";
import { Certification } from "../../types/data-manager.types";
import { fetchItems } from "../../utils/crud";
import { LoadingSpinner, formatMonthYear, parseDate } from "../../utils/ui";

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
			<div className="d-flex align-items-center justify-content-center" style={{ minHeight: "200px" }}>
				<LoadingSpinner />
			</div>
		);

	if (error) return <div className="text-danger">{error}</div>;

	if (certifications.length === 0) return <div>No certifications found.</div>;

	const today = new Date();

	return (
		<div className="about-tab-content">
			<div className="about-scroll">
				<ul className="cert-grid">
					{certifications.map(cert => {
						const expired = !!cert.expiryDate && parseDate(cert.expiryDate) < today;
						return (
							<li key={cert.id} className="cert-card">
								{cert.imageUrl && (
									<img src={cert.imageUrl} alt={`${cert.name} badge`} className="cert-badge" loading="lazy" />
								)}
								<div className="cert-body">
									<h3 className="cert-name">{cert.name}</h3>
									<p className="cert-meta">
										{cert.issuer} · Issued {formatMonthYear(cert.issueDate)}
									</p>
									{cert.expiryDate && (
										<p className="cert-status">
											<span className={`cert-status-pill${expired ? " expired" : ""}`}>
												{expired ? "Expired" : "Valid until"} {formatMonthYear(cert.expiryDate)}
											</span>
										</p>
									)}
									{cert.description && <p className="cert-description">{cert.description}</p>}
									{cert.credentialUrl && (
										<a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-verify">
											Verify credential
											<span className="visually-hidden">: {cert.name}, opens in a new tab</span>
											<span className="about-button-icon" aria-hidden="true">
												<FaExternalLinkAlt />
											</span>
										</a>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
};
