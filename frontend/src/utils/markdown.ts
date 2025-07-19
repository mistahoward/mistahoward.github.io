// Simple markdown to HTML converter
export const markdownToHtml = (markdown: string): string => {
	return markdown
		.replace(/^### (.*$)/gim, "<h3>$1</h3>")
		.replace(/^## (.*$)/gim, "<h2>$1</h2>")
		.replace(/^# (.*$)/gim, "<h1>$1</h1>")
		.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
		.replace(/\*(.*)\*/gim, "<em>$1</em>")
		.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, "<img src=\"$2\" alt=\"$1\" class=\"img-fluid\" />")
		.replace(/\[([^\]]*)\]\(([^)]+)\)/gim, "<a href=\"$2\">$1</a>")
		.replace(/\n/gim, "<br />");
}; 