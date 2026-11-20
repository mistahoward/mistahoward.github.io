import { h } from "preact";
import { YakShaverSpinner } from "../components/shared/YakShaverSpinner";

export const LoadingSpinner = YakShaverSpinner;

export const ErrorAlert = ({ error }: { error: string }) =>
	h("div", { className: "alert alert-danger" }, error);

export const SuccessAlert = ({ message }: { message: string }) =>
	h("div", { className: "alert alert-success" }, message);

export const InfoAlert = ({ message }: { message: string }) =>
	h("div", { className: "alert alert-info" }, message);

export const WarningAlert = ({ message }: { message: string }) =>
	h("div", { className: "alert alert-warning" }, message);

// A plain "YYYY-MM-DD" date is a calendar day, not a moment. `new Date("2026-06-01")` reads it as
// midnight UTC, which is still May 31 in US time zones, so read it as local midnight instead.
// Anything else (a full timestamp) parses as usual.
export const parseDate = (dateString: string): Date => {
	const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString.trim());
	if (day) return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
	return new Date(dateString);
};

export const formatDate = (dateString: string): string => {
	if (!dateString) return "";
	return parseDate(dateString).toLocaleDateString();
};

// "Jun 2025". D1 timestamps ("2026-10-23 08:11:46") get a "T" first, since Safari can't parse the space.
export const formatMonthYear = (dateString?: string): string => {
	if (!dateString) return "";
	const date = parseDate(dateString.replace(/^(\d{4}-\d{2}-\d{2}) /, "$1T"));
	if (isNaN(date.getTime())) return dateString;
	return date.toLocaleString("default", { month: "short", year: "numeric" });
};

export const formatDateTime = (dateString: string): string => {
	return new Date(dateString).toLocaleString();
};

export const capitalizeFirst = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getNavbarHeight = (): number => {
	const navbar = document.querySelector<HTMLElement>(".custom-navbar");
	return navbar ? navbar.offsetHeight : 0;
};

// Smooth-scrolls so the element's top sits just below the fixed navbar
export const scrollToElement = (element: HTMLElement) => {
	const top = element.getBoundingClientRect().top + window.scrollY - getNavbarHeight() - 8;
	window.scrollTo({ top, behavior: "smooth" });
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
