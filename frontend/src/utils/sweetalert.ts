import Swal from "sweetalert2";

// Get CSS custom properties for theme-aware colors
const getThemeColors = () => {
	const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";

	if (isDark) {
		return {
			background: "#111827", // --bs-body-bg
			color: "#f9fafb", // --bs-body-color
			primary: "#fbbf24", // --bs-primary
			success: "#22c55e", // --bs-success
			danger: "#ef4444", // --bs-danger
			warning: "#f59e0b", // --bs-warning
			info: "#3b82f6", // --bs-info
			border: "#374151", // --bs-border-color
		};
	}

	return {
		background: "#fff", // --bs-body-bg
		color: "#212529", // --bs-body-color
		primary: "#f97316", // --bs-primary
		success: "#198754", // --bs-success
		danger: "#dc3545", // --bs-danger
		warning: "#ffc107", // --bs-warning
		info: "#0dcaf0", // --bs-info
		border: "#dee2e6", // --bs-border-color
	};
};

// Base configuration for all SweetAlert2 instances
const getBaseConfig = () => {
	const colors = getThemeColors();

	return {
		background: colors.background,
		color: colors.color,
		confirmButtonColor: colors.primary,
		cancelButtonColor: colors.danger,
		allowOutsideClick: true,
		allowEscapeKey: true,
		scrollbarPadding: false,
		heightAuto: true,
		backdrop: true,
		showClass: {
			popup: "animate__animated animate__fadeInDown"
		},
		hideClass: {
			popup: "animate__animated animate__fadeOutUp"
		},
		customClass: {
			popup: "swal2-custom",
			confirmButton: "btn btn-primary",
			cancelButton: "btn btn-danger",
			denyButton: "btn btn-secondary",
			input: "form-control"
		}
	};
};

// Success alert
export const showSuccess = (title: string, message?: string) => {
	const colors = getThemeColors();
	return Swal.fire({
		...getBaseConfig(),
		icon: "success",
		title,
		text: message,
		confirmButtonColor: colors.success,
		confirmButtonText: "OK"
	});
};

// Error alert
export const showError = (title: string, message?: string) => {
	const colors = getThemeColors();
	return Swal.fire({
		...getBaseConfig(),
		icon: "error",
		title,
		text: message,
		confirmButtonColor: colors.danger,
		confirmButtonText: "OK"
	});
};

// Warning alert
export const showWarning = (title: string, message?: string) => {
	const colors = getThemeColors();
	return Swal.fire({
		...getBaseConfig(),
		icon: "warning",
		title,
		text: message,
		confirmButtonColor: colors.warning,
		confirmButtonText: "OK"
	});
};

// Info alert
export const showInfo = (title: string, message?: string) => {
	const colors = getThemeColors();
	return Swal.fire({
		...getBaseConfig(),
		icon: "info",
		title,
		text: message,
		confirmButtonColor: colors.info,
		confirmButtonText: "OK"
	});
};

// Confirmation dialog
export const showConfirm = (title: string, message?: string, confirmText = "Yes", cancelText = "No") => {
	// Store original body overflow
	const originalOverflow = document.body.style.overflow;

	return Swal.fire({
		...getBaseConfig(),
		icon: "question",
		title,
		text: message,
		showCancelButton: true,
		confirmButtonText: confirmText,
		cancelButtonText: cancelText,
		reverseButtons: true,
		didOpen: () => {
			// Hide body scrollbar
			document.body.style.overflow = "hidden";
		},
		willClose: () => {
			// Restore body overflow
			document.body.style.overflow = originalOverflow;
		}
	});
};

// Delete confirmation dialog
export const showDeleteConfirm = (itemName: string = "this item") => {
	return showConfirm(
		"Confirm Delete",
		`Are you sure you want to delete ${itemName}? This action cannot be undone.`,
		"Delete",
		"Cancel"
	);
};

// Input dialog
export const showInput = (title: string, message?: string, inputType: "text" | "email" | "password" | "number" = "text") => {
	return Swal.fire({
		...getBaseConfig(),
		title,
		text: message,
		input: inputType,
		inputPlaceholder: `Enter ${inputType}`,
		showCancelButton: true,
		confirmButtonText: "OK",
		cancelButtonText: "Cancel",
		inputValidator: (value) => {
			if (!value) {
				return "You need to write something!";
			}
		}
	});
};

// Toast notification
export const showToast = (title: string, icon: "success" | "error" | "warning" | "info" = "success") => {
	return Swal.fire({
		...getBaseConfig(),
		icon,
		title,
		toast: true,
		position: "top-end",
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		didOpen: (toast) => {
			toast.addEventListener("mouseenter", Swal.stopTimer);
			toast.addEventListener("mouseleave", Swal.resumeTimer);
		}
	});
};

// Loading dialog
export const showLoading = (title: string = "Loading...") => {
	return Swal.fire({
		...getBaseConfig(),
		title,
		allowOutsideClick: false,
		allowEscapeKey: false,
		showConfirmButton: false,
		didOpen: () => {
			Swal.showLoading();
		}
	});
};

// Close any open SweetAlert2 dialog
export const closeAlert = () => {
	Swal.close();
}; 