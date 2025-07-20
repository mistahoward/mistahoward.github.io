import { UserBadgeProps } from "../../types/user-badge.types";

export const UserBadge = ({ role, className = "" }: UserBadgeProps) => {
	if (!role || role === "user") return null;

	const getBadgeConfig = (role: string) => {
		switch (role) {
			case "admin":
				return {
					text: "Admin",
					className: "admin",
				};
			case "author":
				return {
					text: "Author",
					className: "author",
				};
			case "moderator":
				return {
					text: "Moderator",
					className: "moderator",
				};
			default:
				return null;
		}
	};

	const config = getBadgeConfig(role);
	if (!config) return null;

	return <span className={`user-badge ${config.className} ${className}`}>{config.text}</span>;
};
