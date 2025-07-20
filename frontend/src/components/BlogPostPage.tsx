import { useEffect, useState } from "preact/hooks";
import { BlogPost } from "../types/blog-editor.types";
import { YakShaverSpinner } from "./shared/YakShaverSpinner";
import { format } from "date-fns";
import { route } from "preact-router";
import { markdownToHtml } from "../utils/markdown";
import { API_URL } from "../utils/api";
import { updatePageTitle } from "../utils/title";
import { CommentsSection } from "./comments/CommentsSection";

const BlogPostPage = (props: { slug?: string }) => {
	const { slug } = props;
	console.log("BlogPostPage: Component mounted with props:", props, "slug:", slug);
	const [post, setPost] = useState<BlogPost | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!slug) {
			setError("No blog post specified.");
			setLoading(false);
			return;
		}
		setLoading(true);
		fetch(`${API_URL}/api/blog/${encodeURIComponent(slug)}`)
			.then(res => (res.ok ? res.json() : Promise.reject(res)))
			.then(data => {
				console.log("Fetched blog post data:", data);
				setPost(data);
				// Update page title with blog post title
				updatePageTitle(undefined, data.title);
				setLoading(false);
			})
			.catch(err => {
				console.error("Error fetching blog post:", err);
				setError("Blog post not found.");
				// Reset title on error
				updatePageTitle();
				setLoading(false);
			});
	}, [slug]);

	// Reset title when component unmounts
	useEffect(() => {
		return () => {
			updatePageTitle();
		};
	}, []);

	const scrollToComments = () => {
		const commentsSection = document.getElementById("comments-section");
		if (commentsSection) {
			commentsSection.scrollIntoView({ behavior: "smooth" });
		}
	};

	if (loading) return <YakShaverSpinner />;
	if (error) return <div className="container my-5 text-center text-danger">{error}</div>;
	if (!post) return null;

	console.log("BlogPostPage: Rendering post:", post.title);

	return (
		<div className="blog-post-layout" style={{ paddingTop: "6rem", minHeight: "100vh" }}>
			<div className="container-fluid">
				<div className="row">
					{/* Blog Post Content - Left Column */}
					<div className="col-lg-7 col-xl-8">
						<div className="blog-post-content-wrapper">
							<article className="blog-post">
								<header className="blog-post-header mb-4">
									<div className="d-flex align-items-center justify-content-between mb-3">
										<button
											className="btn btn-link text-decoration-none p-0"
											onClick={() => {
												console.log("Back button clicked!");
												route("/blogs");
											}}
											style={{ fontSize: "0.9rem", color: "#6c757d" }}
										>
											← Back to Blogs
										</button>
										<button
											className="btn btn-link text-decoration-none p-0 jump-to-comments-btn d-lg-none"
											onClick={scrollToComments}
											style={{ fontSize: "0.9rem", color: "#6c757d" }}
										>
											Jump to Comments ↓
										</button>
									</div>
									<h1 className="display-4 fw-bold mb-3">{post.title}</h1>
									<div className="d-flex align-items-center gap-3 text-secondary">
										<span className="fw-medium">Author: Alex Howard</span>
										<span>•</span>
										<span>{post.publishedAt ? format(new Date(post.publishedAt), "PPP") : ""}</span>
									</div>
								</header>

								{post.excerpt && (
									<div className="blog-excerpt mb-4">
										<p className="lead text-muted">{post.excerpt}</p>
									</div>
								)}

								<div className="blog-post-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
							</article>
						</div>
					</div>

					{/* Comments Section - Right Column */}
					<div className="col-lg-5 col-xl-4">
						<div className="comments-sidebar" id="comments-section">
							{slug && <CommentsSection blogSlug={slug} />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BlogPostPage;
