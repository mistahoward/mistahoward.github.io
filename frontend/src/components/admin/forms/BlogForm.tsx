import { BlogFormProps } from "../../../types/blog-editor.types";
import { generateSlug, handleTextInputChange, handleTextAreaChange, handleCheckboxChange } from "../../../utils/form";
import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import { MarkdownEditor } from "./MarkdownEditor";
import { StatePersistence } from "../../../utils/state-persistence";
import { AutoSaveToast } from "../shared/AutoSaveToast";

export const BlogForm = ({ formData, setFormData, onSubmit, onCancel, editingItem }: BlogFormProps) => {
	const [allTags, setAllTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
	const [showRestorePrompt, setShowRestorePrompt] = useState(false);
	const [hasCheckedForSavedData, setHasCheckedForSavedData] = useState(false);
	const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [saveStatus, setSaveStatus] = useState({ lastSaved: undefined as Date | undefined, hasUnsavedChanges: false, isSaving: false });
	const tagInputRef = useRef<HTMLInputElement>(null);
	const persistenceRef = useRef<StatePersistence | null>(null);

	// Initialize persistence instance
	useEffect(() => {
		const autoSaveKey = editingItem ? `blog_edit_${editingItem.id}` : "blog_new";
		persistenceRef.current = StatePersistence.getInstance(autoSaveKey, {
			debounceMs: 10000, // Save every 10 seconds after changes
			maxSize: 2 * 1024 * 1024, // 2MB limit for blog posts
		});
	}, [editingItem]);

	// Initialize form after a short delay
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitialized(true);
			console.log("BlogForm initialized");
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	// Check for saved data on mount
	useEffect(() => {
		if (hasCheckedForSavedData || !persistenceRef.current) return;

		// Only show restore prompt for new posts (not when editing existing ones)
		if (!editingItem && persistenceRef.current.hasSavedData()) {
			setShowRestorePrompt(true);
		}
		setHasCheckedForSavedData(true);
	}, [editingItem, hasCheckedForSavedData]);

	// Manual auto-save function
	const triggerAutoSave = useCallback(() => {
		if (!persistenceRef.current || !hasUserMadeChanges || !isInitialized) return;

		// Set saving status
		setSaveStatus(prev => ({ ...prev, isSaving: true, hasUnsavedChanges: true }));

		try {
			persistenceRef.current.save(formData);
			const status = persistenceRef.current.getSaveStatus();
			setSaveStatus({
				lastSaved: status.lastSaved,
				hasUnsavedChanges: status.hasUnsavedChanges,
				isSaving: status.isSaving,
			});
			console.log("Auto-save completed");
		} catch (error) {
			console.error("Auto-save failed:", error);
			setSaveStatus(prev => ({ ...prev, isSaving: false }));
		}
	}, [formData, hasUserMadeChanges, isInitialized]);

	// Auto-save timer - save every 10 seconds when there are unsaved changes
	useEffect(() => {
		if (!hasUserMadeChanges || !isInitialized) return;

		const interval = setInterval(() => {
			triggerAutoSave();
		}, 10000); // Save every 10 seconds

		return () => clearInterval(interval);
	}, [hasUserMadeChanges, isInitialized, triggerAutoSave]);

	// Track when user makes changes
	useEffect(() => {
		if (!isInitialized) return;

		// Check if form data has meaningful content
		const hasContent = formData.title.trim() || formData.content.trim() || formData.excerpt.trim() || formData.tags.length > 0;

		if (hasContent && !hasUserMadeChanges) {
			console.log("User made changes detected");
			setHasUserMadeChanges(true);
		}
	}, [formData, hasUserMadeChanges, isInitialized]);

	// Handle beforeunload to force save
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (hasUserMadeChanges && persistenceRef.current) {
				persistenceRef.current.forceSave(formData);
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [formData, hasUserMadeChanges]);

	const handleRestoreData = () => {
		if (!persistenceRef.current) return;

		const savedData = persistenceRef.current.load(null as any);
		if (savedData) {
			setFormData(savedData);
			setHasUserMadeChanges(true);
			setShowRestorePrompt(false);
		}
	};

	const handleClearSavedData = () => {
		if (persistenceRef.current) {
			persistenceRef.current.clear();
		}
		setShowRestorePrompt(false);
	};

	useEffect(() => {
		const token = localStorage.getItem("adminToken");
		fetch("/api/admin/tags", {
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		})
			.then(res => res.json())
			.then(data => {
				const tags = Array.isArray(data) ? data : data.data || [];
				setAllTags(tags.map((t: any) => t.name));
			});
	}, []);

	useEffect(() => {
		if (tagInput.trim() === "") {
			setTagSuggestions([]);
			return;
		}
		const inputLower = tagInput.toLowerCase();
		setTagSuggestions(allTags.filter(t => t.toLowerCase().includes(inputLower) && !formData.tags.includes(t)));
	}, [tagInput, allTags, formData.tags]);

	const addTag = (tag: string) => {
		if (!formData.tags.includes(tag)) {
			setFormData({ ...formData, tags: [...formData.tags, tag] });
			setHasUserMadeChanges(true);
		}
		setTagInput("");
		setTagSuggestions([]);
		if (tagInputRef.current) tagInputRef.current.focus();
	};

	const removeTag = (tag: string) => {
		setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
		setHasUserMadeChanges(true);
	};

	const handleTagInputKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && tagInput.trim()) {
			e.preventDefault();
			addTag(tagInput.trim());
		}
		if (e.key === "Backspace" && !tagInput && formData.tags.length) {
			removeTag(formData.tags[formData.tags.length - 1]);
		}
	};

	const handleTagSuggestionClick = (tag: string) => {
		addTag(tag);
	};

	const handleTagInputChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		setTagInput(target.value);
	};

	const handleGenerateSlug = () => {
		const slug = generateSlug(formData.title);
		setFormData({ ...formData, slug });
		setHasUserMadeChanges(true);
	};

	const handleSubmit = () => {
		// Clear saved data on successful submit
		if (persistenceRef.current) {
			persistenceRef.current.clear();
		}
		onSubmit();
	};

	const handleCancel = () => {
		// Clear saved data on cancel
		if (persistenceRef.current) {
			persistenceRef.current.clear();
		}
		onCancel();
	};

	return (
		<>
			{/* Auto-save toast notification */}
			<AutoSaveToast
				isVisible={hasUserMadeChanges && isInitialized}
				lastSaved={saveStatus.lastSaved}
				hasUnsavedChanges={saveStatus.hasUnsavedChanges}
			/>

			<div className="card mb-3">
				<div className="card-body">
					<h4 className="card-title">{editingItem ? "Edit Post" : "Create New Post"}</h4>

					{/* Auto-save restore prompt */}
					{showRestorePrompt && (
						<div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
							<div>
								<strong>📝 Unsaved Changes Found!</strong>
								<br />
								<small>We found unsaved changes from a previous session. Would you like to restore them?</small>
							</div>
							<div className="d-flex gap-2">
								<button onClick={handleRestoreData} className="btn btn-sm btn-primary">
									Restore
								</button>
								<button onClick={handleClearSavedData} className="btn btn-sm btn-outline-secondary">
									Discard
								</button>
							</div>
						</div>
					)}

					<div className="mb-3">
						<label className="form-label">Title</label>
						<input
							type="text"
							className="form-control"
							value={formData.title}
							onChange={e => {
								handleTextInputChange(formData, setFormData, "title")(e);
								setHasUserMadeChanges(true);
							}}
							placeholder="Post title"
						/>
					</div>

					<div className="mb-3">
						<label className="form-label">Slug</label>
						<div className="input-group">
							<input
								type="text"
								className="form-control"
								value={formData.slug}
								onChange={e => {
									handleTextInputChange(formData, setFormData, "slug")(e);
									setHasUserMadeChanges(true);
								}}
								placeholder="post-slug"
							/>
							<button onClick={handleGenerateSlug} className="btn btn-outline-secondary">
								Generate
							</button>
						</div>
					</div>

					<div className="mb-3">
						<label className="form-label">Tags</label>
						<div className="d-flex flex-wrap gap-2 mb-2">
							{formData.tags.map(tag => (
								<span key={tag} className="badge bg-primary d-flex align-items-center" style={{ fontSize: "1rem" }}>
									{tag}
									<button
										type="button"
										className="btn-close btn-close-white ms-2"
										style={{ fontSize: "0.8rem" }}
										aria-label="Remove"
										onClick={() => removeTag(tag)}
									/>
								</span>
							))}
						</div>
						<input
							type="text"
							className="form-control"
							placeholder="Type to search or add tags..."
							value={tagInput}
							onInput={handleTagInputChange}
							onKeyDown={handleTagInputKeyDown as any}
							ref={tagInputRef}
						/>
						{tagSuggestions.length > 0 && (
							<ul className="list-group position-absolute" style={{ zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
								{tagSuggestions.map(tag => (
									<li
										key={tag}
										className="list-group-item list-group-item-action"
										style={{ cursor: "pointer" }}
										onClick={() => handleTagSuggestionClick(tag)}
									>
										{tag}
									</li>
								))}
							</ul>
						)}
					</div>

					<div className="mb-3">
						<label className="form-label">Excerpt</label>
						<textarea
							className="form-control"
							value={formData.excerpt}
							onChange={e => {
								handleTextAreaChange(formData, setFormData, "excerpt")(e);
								setHasUserMadeChanges(true);
							}}
							placeholder="Brief description of the post"
							rows={3}
						/>
					</div>

					<div className="mb-3">
						<label className="form-label">Content</label>
						<MarkdownEditor
							value={formData.content}
							onChange={value => {
								setFormData({ ...formData, content: value });
								setHasUserMadeChanges(true);
							}}
							placeholder="Post content (markdown supported)"
							rows={15}
						/>
					</div>

					<div className="mb-3">
						<div className="form-check">
							<input
								type="checkbox"
								className="form-check-input"
								checked={formData.published}
								onChange={e => {
									handleCheckboxChange(formData, setFormData, "published")(e);
									setHasUserMadeChanges(true);
								}}
								id="published-check"
							/>
							<label className="form-check-label" htmlFor="published-check">
								Published
							</label>
						</div>
					</div>

					<div className="d-flex gap-2">
						<button onClick={handleSubmit} className="btn btn-primary">
							{editingItem ? "Update" : "Create"}
						</button>
						<button onClick={handleCancel} className="btn btn-secondary">
							Cancel
						</button>
					</div>
				</div>
			</div>
		</>
	);
};
