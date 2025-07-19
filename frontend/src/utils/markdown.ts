import DOMPurify from "dompurify";
import { measureTime } from "./performance";

// Cache for markdown conversions to avoid repeated processing
const markdownCache = new Map<string, string>();

// Simple markdown to HTML converter with sanitization
// This prevents XSS attacks by sanitizing HTML before rendering
// Examples of blocked attacks:
// - <script>alert('xss')</script> -> removed
// - <img src="x" onerror="alert('xss')"> -> onerror attribute removed
// - <a href="javascript:alert('xss')">link</a> -> javascript: protocol blocked
export const markdownToHtml = (markdown: string): string => {
	return measureTime("markdownToHtml", () => {
		// Check cache first
		if (markdownCache.has(markdown)) {
			return markdownCache.get(markdown)!;
		}

		// Limit cache size to prevent memory issues
		if (markdownCache.size > 100) {
			const firstKey = markdownCache.keys().next().value;
			markdownCache.delete(firstKey);
		}

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
		const sanitizedHtml = DOMPurify.sanitize(html, {
			ALLOWED_TAGS: [
				"h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "strong", "em",
				"a", "img", "ul", "ol", "li", "blockquote", "code", "pre"
			],
			ALLOWED_ATTR: ["href", "src", "alt", "class"],
			ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
		});

		// Cache the result
		markdownCache.set(markdown, sanitizedHtml);
		return sanitizedHtml;
	});
};

// Debounced version for better performance
export const createDebouncedMarkdownConverter = (delay: number = 300) => {
	let timeoutId: number | null = null;
	let lastValue = "";
	let lastResult = "";
	let isProcessing = false;

	const converter = async (markdown: string): Promise<string> => {
		// Return cached result immediately if value hasn't changed
		if (markdown === lastValue && lastResult) {
			return lastResult;
		}

		// Clear existing timeout
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		// For very short content, process immediately
		if (markdown.length < 100) {
			lastValue = markdown;
			lastResult = markdownToHtml(markdown);
			return lastResult;
		}

		// For longer content, debounce the processing
		return new Promise<string>((resolve) => {
			timeoutId = window.setTimeout(async () => {
				if (isProcessing) {
					// If already processing, wait for it to complete
					resolve(lastResult || markdownToHtml(markdown));
					return;
				}

				isProcessing = true;
				try {
					lastValue = markdown;
					lastResult = markdownToHtml(markdown);
					resolve(lastResult);
				} catch (error) {
					console.error("Error in debounced markdown conversion:", error);
					resolve(markdownToHtml(markdown));
				} finally {
					isProcessing = false;
				}
			}, delay);
		});
	};

	// Add cleanup method to prevent memory leaks
	converter.cleanup = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		lastValue = "";
		lastResult = "";
		isProcessing = false;
	};

	return converter;
};

// Cleanup function to clear cache when needed
export const clearMarkdownCache = () => {
	markdownCache.clear();
}; 