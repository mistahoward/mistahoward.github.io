import { useState, useRef, useCallback, useEffect, useMemo } from "preact/hooks";
import { YakShaverSpinner } from "../../shared/YakShaverSpinner";
import { markdownToHtml, createDebouncedMarkdownConverter } from "../../../utils/markdown";

interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	rows?: number;
	className?: string;
}

export const MarkdownEditor = ({ value, onChange, placeholder, rows = 15, className = "" }: MarkdownEditorProps) => {
	const [isUploading, setIsUploading] = useState(false);
	const [previewMode, setPreviewMode] = useState(false);
	const [previewContent, setPreviewContent] = useState("");
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const lastValueRef = useRef<string>("");

	// Create debounced markdown converter only once
	const debouncedConverter = useMemo(() => createDebouncedMarkdownConverter(300), []);

	const insertImageAtCursor = useCallback(
		(imageUrl: string, altText: string = "") => {
			if (!textareaRef.current) return;

			const textarea = textareaRef.current;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const imageMarkdown = `![${altText}](${imageUrl})`;

			const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
			onChange(newValue);

			// Set cursor position after the inserted image
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
			}, 0);
		},
		[value, onChange]
	);

	// Update preview content only when in preview mode and value changes
	useEffect(() => {
		if (!previewMode) {
			// Clear preview content when not in preview mode to save memory
			setPreviewContent("");
			return;
		}

		// Only update if value actually changed
		if (value === lastValueRef.current) return;
		lastValueRef.current = value;

		const updatePreview = async () => {
			setIsPreviewLoading(true);
			try {
				// Use debounced converter for better performance
				const html = await debouncedConverter(value || "");
				setPreviewContent(html);
			} catch (error) {
				console.error("Error converting markdown:", error);
				// Fallback to immediate conversion
				setPreviewContent(markdownToHtml(value || ""));
			} finally {
				setIsPreviewLoading(false);
			}
		};

		updatePreview();
	}, [value, previewMode, debouncedConverter]);

	// Cleanup function to clear preview content when component unmounts
	useEffect(() => {
		return () => {
			setPreviewContent("");
			lastValueRef.current = "";
			// Cleanup the debounced converter to prevent memory leaks
			if (debouncedConverter.cleanup) {
				debouncedConverter.cleanup();
			}
		};
	}, [debouncedConverter]);

	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const handlePasteEvent = (e: ClipboardEvent) => {
			console.log("Paste event triggered", e.clipboardData);
			const items = e.clipboardData?.items;
			if (!items) {
				console.log("No clipboard items found");
				return;
			}

			let hasImage = false;
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				console.log("Clipboard item:", item.type);
				if (item.type.indexOf("image") !== -1) {
					hasImage = true;
					break;
				}
			}

			if (!hasImage) {
				console.log("No image found in clipboard");
				return;
			}

			console.log("Image found in clipboard, starting upload...");
			e.preventDefault();
			setIsUploading(true);

			(async () => {
				try {
					for (let i = 0; i < items.length; i++) {
						const item = items[i];
						if (item.type.indexOf("image") !== -1) {
							const file = item.getAsFile();
							if (!file) continue;

							console.log("Uploading file:", file.name, file.type, file.size);
							const formData = new FormData();
							formData.append("image", file);

							const token = localStorage.getItem("adminToken");
							const response = await fetch("/api/admin/upload-image", {
								method: "POST",
								headers: token ? { Authorization: `Bearer ${token}` } : {},
								body: formData,
							});

							if (response.ok) {
								const data = await response.json();
								console.log("Upload successful:", data.url);
								insertImageAtCursor(data.url, file.name);
							} else {
								console.error("Failed to upload image");
							}
						}
					}
				} catch (error) {
					console.error("Error uploading image:", error);
				} finally {
					setIsUploading(false);
				}
			})();
		};

		textarea.addEventListener("paste", handlePasteEvent);
		return () => {
			textarea.removeEventListener("paste", handlePasteEvent);
		};
	}, [insertImageAtCursor]);

	const handleDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		async (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			const files = e.dataTransfer?.files;
			if (!files || files.length === 0) return;

			setIsUploading(true);

			try {
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					if (!file.type.startsWith("image/")) continue;

					const formData = new FormData();
					formData.append("image", file);

					const token = localStorage.getItem("adminToken");
					const response = await fetch("/api/admin/upload-image", {
						method: "POST",
						headers: token ? { Authorization: `Bearer ${token}` } : {},
						body: formData,
					});

					if (response.ok) {
						const data = await response.json();
						insertImageAtCursor(data.url, file.name);
					} else {
						console.error("Failed to upload image:", file.name);
					}
				}
			} catch (error) {
				console.error("Error uploading images:", error);
			} finally {
				setIsUploading(false);
			}
		},
		[insertImageAtCursor]
	);

	const handleFileInput = useCallback(
		async (e: Event) => {
			const target = e.target as HTMLInputElement;
			const files = target.files;
			if (!files || files.length === 0) return;

			setIsUploading(true);

			try {
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					if (!file.type.startsWith("image/")) continue;

					const formData = new FormData();
					formData.append("image", file);

					const token = localStorage.getItem("adminToken");
					const response = await fetch("/api/admin/upload-image", {
						method: "POST",
						headers: token ? { Authorization: `Bearer ${token}` } : {},
						body: formData,
					});

					if (response.ok) {
						const data = await response.json();
						insertImageAtCursor(data.url, file.name);
					} else {
						console.error("Failed to upload image:", file.name);
					}
				}
			} catch (error) {
				console.error("Error uploading images:", error);
			} finally {
				setIsUploading(false);
				// Reset the file input
				target.value = "";
			}
		},
		[insertImageAtCursor]
	);

	const handlePreviewToggle = useCallback(() => {
		setPreviewMode(!previewMode);
		if (!previewMode && !previewContent) {
			// Initialize preview content when switching to preview mode
			setPreviewContent(markdownToHtml(value || ""));
		}
	}, [previewMode, previewContent, value]);

	return (
		<div className={`markdown-editor ${className}`}>
			<div className="d-flex justify-content-between align-items-center mb-2">
				<div className="btn-group" role="group">
					<button
						type="button"
						className={`btn btn-sm ${!previewMode ? "btn-primary" : "btn-outline-primary"}`}
						onClick={() => setPreviewMode(false)}
					>
						Edit
					</button>
					<button
						type="button"
						className={`btn btn-sm ${previewMode ? "btn-primary" : "btn-outline-primary"}`}
						onClick={handlePreviewToggle}
					>
						Preview
					</button>
				</div>
				<div className="d-flex gap-2">
					<input type="file" accept="image/*" multiple className="d-none" id="image-upload" onChange={handleFileInput} />
					<label htmlFor="image-upload" className="btn btn-sm btn-outline-secondary">
						📷 Upload Images
					</label>
					{isUploading && <YakShaverSpinner />}
				</div>
			</div>

			{!previewMode ? (
				<div className="form-control" style={{ minHeight: `${rows * 1.5}rem` }} onDragOver={handleDragOver} onDrop={handleDrop}>
					<textarea
						ref={textareaRef}
						className="form-control border-0"
						value={value}
						onChange={e => onChange((e.target as HTMLTextAreaElement).value)}
						placeholder={placeholder}
						rows={rows}
						style={{ resize: "none", minHeight: `${rows * 1.5}rem` }}
					/>
				</div>
			) : (
				<div className="form-control" style={{ minHeight: `${rows * 1.5}rem`, overflowY: "auto" }}>
					{isPreviewLoading ? (
						<div className="d-flex justify-content-center align-items-center" style={{ minHeight: "10rem" }}>
							<YakShaverSpinner />
						</div>
					) : (
						<div className="markdown-preview" dangerouslySetInnerHTML={{ __html: previewContent }} />
					)}
				</div>
			)}

			<div className="form-text">💡 Tip: You can paste images directly from your clipboard or drag and drop them here!</div>
		</div>
	);
};
