export const generateSlug = (title: string): string => {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
};

export const resetFormData = <T extends Record<string, any>>(initialState: T): T => {
	return { ...initialState };
};

export const handleInputChange = <T extends Record<string, any>>(
	formData: T,
	setFormData: (data: T) => void,
	field: keyof T,
	value: any
): void => {
	setFormData({ ...formData, [field]: value });
};

export const handleTextInputChange =
	<T extends Record<string, any>>(formData: T, setFormData: (data: T) => void, field: keyof T) =>
		(e: Event) => {
			const target = e.target as HTMLInputElement;
			handleInputChange(formData, setFormData, field, target.value);
		};

export const handleTextAreaChange =
	<T extends Record<string, any>>(formData: T, setFormData: (data: T) => void, field: keyof T) =>
		(e: Event) => {
			const target = e.target as HTMLTextAreaElement;
			handleInputChange(formData, setFormData, field, target.value);
		};

export const handleSelectChange =
	<T extends Record<string, any>>(formData: T, setFormData: (data: T) => void, field: keyof T) =>
		(e: Event) => {
			const target = e.target as HTMLSelectElement;
			handleInputChange(formData, setFormData, field, target.value);
		};

export const handleCheckboxChange =
	<T extends Record<string, any>>(formData: T, setFormData: (data: T) => void, field: keyof T) =>
		(e: Event) => {
			const target = e.target as HTMLInputElement;
			handleInputChange(formData, setFormData, field, target.checked);
		};

export const handleNumberInputChange =
	<T extends Record<string, any>>(formData: T, setFormData: (data: T) => void, field: keyof T) =>
		(e: Event) => {
			const target = e.target as HTMLInputElement;
			const value = target.value === "" ? "" : parseInt(target.value);
			handleInputChange(formData, setFormData, field, value);
		};
