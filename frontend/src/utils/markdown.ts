import DOMPurify from "dompurify";

// Simple markdown to HTML converter with sanitization
// This prevents XSS attacks by sanitizing HTML before rendering
// Examples of blocked attacks:
// - <script>alert('xss')</script> -> removed
// - <img src="x" onerror="alert('xss')"> -> onerror attribute removed
// - <a href="javascript:alert('xss')">link</a> -> javascript: protocol blocked
export const markdownToHtml = (markdown: string): string => {
	const html = markdown
		.replace(/^### (.*$)/gim, "<h3>$1</h3>")
		.replace(/^## (.*$)/gim, "<h2>$1</h2>")
		.replace(/^# (.*$)/gim, "<h1>$1</h1>")
		.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
		.replace(/\*(.*)\*/gim, "<em>$1</em>")
		.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, "<img src=\"$2\" alt=\"$1\" class=\"img-fluid\" />")
		.replace(/\[([^\]]*)\]\(([^)]+)\)/gim, "<a href=\"$2\">$1</a>")
		.replace(/\n/gim, "<br />");

	// Sanitize the HTML to prevent XSS attacks
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			"h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "strong", "em",
			"a", "img", "ul", "ol", "li", "blockquote", "code", "pre"
		],
		ALLOWED_ATTR: ["href", "src", "alt", "class"],
		ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
	});
}; 