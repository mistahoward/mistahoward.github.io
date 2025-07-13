import { LoadingSpinner, ErrorAlert } from "../../../utils/ui";
import { ManagerLayoutProps } from "../../../types/admin-panel.types";

export const ManagerLayout = ({ title, loading, error, onCreate, createButtonText, children }: ManagerLayoutProps) => {
	if (loading) return <LoadingSpinner />;

	return (
		<div className="h-100 d-flex flex-column">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h3 className="mb-0">{title}</h3>
				<button onClick={onCreate} className="btn btn-success">
					{createButtonText}
				</button>
			</div>

			{error && <ErrorAlert error={error} />}

			{children}
		</div>
	);
};
