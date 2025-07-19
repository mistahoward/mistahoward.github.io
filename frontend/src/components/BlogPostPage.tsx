import { useEffect, useState } from "preact/hooks";
import { BlogPost } from "../types/blog-editor.types";
import { YakShaverSpinner } from "./shared/YakShaverSpinner";
import { format } from "date-fns";
import { route } from "preact-router";
import { markdownToHtml } from "../utils/markdown";
import { API_URL } from "../utils/api";

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
				setLoading(false);
			})
			.catch(err => {
				console.error("Error fetching blog post:", err);
				setError("Blog post not found.");
				setLoading(false);
			});
	}, [slug]);

	if (loading) return <YakShaverSpinner />;
	if (error) return <div className="container my-5 text-center text-danger">{error}</div>;
	if (!post) return null;

	console.log("BlogPostPage: Rendering post:", post.title);

	return (
		<section className="blog-post-page min-vh-100 d-flex align-items-start justify-content-center" style={{ paddingTop: "6rem" }}>
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-lg-8 position-relative">
						<button
							className="btn btn-primary position-absolute"
							style={{ left: "-12rem", top: "0" }}
							onClick={() => {
								console.log("Back button clicked!");
								route("/blogs");
							}}
						>
							← Back to Blogs
						</button>
						<h1 className="display-4 fw-bold mb-2">{post.title}</h1>
						<div className="d-flex align-items-center gap-3 text-secondary mb-4">
							<span className="fw-medium">Author: Alex Howard</span>
							<span>•</span>
							<span>{post.publishedAt ? format(new Date(post.publishedAt), "PPP") : ""}</span>
						</div>
						{post.excerpt && <p className="lead text-muted mb-4">{post.excerpt}</p>}
						<div className="blog-post-content mb-4" dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default BlogPostPage;
