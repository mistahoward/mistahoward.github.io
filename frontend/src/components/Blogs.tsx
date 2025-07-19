import { useEffect, useState, useRef, useMemo } from "preact/hooks";
import { BlogPost } from "../types/blog-editor.types";
import { YakShaverSpinner } from "./shared/YakShaverSpinner";
import { format } from "date-fns";
import { API_URL } from "../utils/api";

export const Blogs = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [allTags, setAllTags] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
	const [search, setSearch] = useState("");
	const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
	const tagDropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setLoading(true);
		fetch(`${API_URL}/api/blog`)
			.then(res => res.json())
			.then(data => {
				const postsData = Array.isArray(data) ? data : data.data || [];
				setPosts(postsData);
				setLoading(false);
			})
			.catch(() => {
				setError("Failed to load blog posts.");
				setLoading(false);
			});
		// Fetch all tags for filter using public endpoint
		fetch(`${API_URL}/api/tags`)
			.then(res => res.json())
			.then(data => {
				const tags = Array.isArray(data) ? data : data.data || [];
				setAllTags(tags.map((t: any) => t.name));
			});
	}, []);

	// Handle scrolling to blogs section when navigating to /blogs
	useEffect(() => {
		if (!loading && window.location.pathname === "/blogs") {
			console.log("Blogs component: Finished loading, checking if we need to scroll");
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				const element = document.getElementById("blogs");
				const navbar = document.querySelector<HTMLElement>(".custom-navbar");
				if (element) {
					console.log("Blogs component: Scrolling to blogs section");
					const navbarHeight = navbar ? navbar.offsetHeight : 0;
					const offset = navbarHeight + 8;
					const rect = element.getBoundingClientRect();
					const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
					const top = rect.top + scrollTop - offset;
					window.scrollTo({ top, behavior: "smooth" });
				}
			}, 100);
		}
	}, [loading]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
				setTagDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleTagToggle = (tag: string) => {
		setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
	};

	const clearAllTags = () => {
		setSelectedTags([]);
	};

	// Filter, search, and sort posts
	const filteredPosts = useMemo(() => {
		const matchesSearch = (post: BlogPost) =>
			post.title.toLowerCase().includes(search.toLowerCase()) ||
			(post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase())) ||
			(post.content && post.content.toLowerCase().includes(search.toLowerCase()));

		const matchesTags = (post: BlogPost) => selectedTags.length === 0 || selectedTags.some(tag => post.tags?.includes(tag));

		return posts
			.filter(post => matchesSearch(post) && matchesTags(post))
			.sort((a, b) => {
				const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
				const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
				return sortOrder === "latest" ? bDate - aDate : aDate - bDate;
			});
	}, [posts, search, selectedTags, sortOrder]);

	if (loading) return <YakShaverSpinner />;
	if (error) return <div className="text-danger text-center my-5">{error}</div>;

	return (
		<section id="blogs" className="min-vh-100 d-flex align-items-center justify-content-center">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12">
						<h2 className="display-4 fw-bold mb-4 text-center">Blogs</h2>
						<div className="d-flex flex-wrap gap-3 align-items-center mb-4 justify-content-center mt-4">
							<div className="d-flex align-items-center gap-2" style={{ minWidth: 300, maxWidth: 400 }}>
								<input
									type="text"
									className="form-control"
									placeholder="Search blogs..."
									value={search}
									onInput={e => setSearch((e.target as HTMLInputElement).value)}
								/>
							</div>

							<button
								type="button"
								className="btn btn-outline-secondary d-flex align-items-center"
								onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
								title={`Sort by date (${sortOrder === "latest" ? "Latest" : "Oldest"} first)`}
							>
								{sortOrder === "latest" ? "Latest" : "Oldest"}
							</button>

							<div className="position-relative" ref={tagDropdownRef}>
								<button
									className="btn btn-outline-secondary dropdown-toggle"
									type="button"
									onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
									style={{ minWidth: 150 }}
								>
									{selectedTags.length === 0
										? "Filter by tags"
										: selectedTags.length === 1
											? selectedTags[0]
											: `${selectedTags.length} tags`}
								</button>
								{tagDropdownOpen && (
									<div className="dropdown-menu show" style={{ width: "100%", maxHeight: 300, overflowY: "auto" }}>
										{selectedTags.length > 0 && (
											<div className="dropdown-item">
												<button className="btn btn-sm btn-outline-danger" onClick={clearAllTags} type="button">
													Clear all
												</button>
											</div>
										)}
										<div className="dropdown-divider"></div>
										{allTags.map(tag => (
											<label
												key={tag}
												className="dropdown-item d-flex align-items-center"
												style={{ cursor: "pointer" }}
											>
												<input
													type="checkbox"
													className="form-check-input me-2"
													checked={selectedTags.includes(tag)}
													onChange={() => handleTagToggle(tag)}
												/>
												{tag}
											</label>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Blog Posts Grid */}
						{filteredPosts.length === 0 ? (
							<div className="text-center">
								<p className="fs-5 text-muted">No blog posts found.</p>
								{(search || selectedTags.length > 0) && (
									<button
										className="btn btn-outline-primary btn-sm"
										onClick={() => {
											setSearch("");
											setSelectedTags([]);
										}}
									>
										Clear filters
									</button>
								)}
							</div>
						) : (
							<div className="row g-4">
								{filteredPosts.map(post => (
									<div key={post.id} className="col-12 col-md-6 col-lg-4">
										<a href={`/blog/${post.slug}`} className="card h-100 blog-card text-decoration-none">
											<div className="card-body d-flex flex-column">
												<h3 className="card-title h5 mb-2">{post.title}</h3>
												{post.excerpt && (
													<p className="card-text text-muted flex-grow-1" style={{ fontSize: "0.9rem" }}>
														{post.excerpt.length > 120 ? `${post.excerpt.substring(0, 120)}...` : post.excerpt}
													</p>
												)}
												<div className="mt-auto">
													{post.tags && post.tags.length > 0 && (
														<div className="mb-2">
															{post.tags.slice(0, 3).map(tag => (
																<span
																	key={tag}
																	className="badge bg-secondary me-1"
																	style={{ fontSize: "0.75rem" }}
																>
																	{tag}
																</span>
															))}
															{post.tags.length > 3 && (
																<span className="badge bg-light text-dark" style={{ fontSize: "0.75rem" }}>
																	+{post.tags.length - 3}
																</span>
															)}
														</div>
													)}
													<div className="text-end text-secondary small">
														{post.published && post.publishedAt
															? format(new Date(post.publishedAt), "PPP")
															: ""}
													</div>
												</div>
											</div>
										</a>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};
