import { h } from "preact";
import { YakShaverSpinner } from "../components/YakShaverSpinner";

export const LoadingSpinner = YakShaverSpinner;

export const ErrorAlert = ({ error }: { error: string }) =>
	h("div", { className: "alert alert-danger" }, error);

export const SuccessAlert = ({ message }: { message: string }) =>
	h("div", { className: "alert alert-success" }, message);

export const InfoAlert = ({ message }: { message: string }) =>
	h("div", { className: "alert alert-info" }, message);

export const WarningAlert = ({ message }: { message: string }) =>
	h("div", { className: "alert alert-warning" }, message);

export const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
	return new Date(dateString).toLocaleString();
};

export const capitalizeFirst = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + "...";
};

export const getStatusBadge = (
	status: boolean,
	activeText = "Active",
	inactiveText = "Inactive"
) => {
	return h(
		"span",
		{
			className: `badge ${status ? "bg-success" : "bg-secondary"}`,
		},
		status ? activeText : inactiveText
	);
};

export const getApprovalBadge = (approved: boolean) => {
	return h(
		"span",
		{
			className: `badge ${approved ? "bg-success" : "bg-warning"}`,
		},
		approved ? "Approved" : "Pending"
	);
};
