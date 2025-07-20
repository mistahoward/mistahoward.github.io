import { describe, it, expect } from "@jest/globals";

// Simple test to verify the testing setup works
describe("Testing Setup", () => {
	it("should have working DOM testing utilities", () => {
		const testElement = document.createElement("div");
		testElement.textContent = "Test Content";
		document.body.appendChild(testElement);

		expect(testElement).toBeInTheDocument();
		expect(testElement).toHaveTextContent("Test Content");

		document.body.removeChild(testElement);
	});

	it("should have working Jest globals", () => {
		expect(true).toBe(true);
		expect(1 + 1).toBe(2);
	});

	it("should have working async/await", async () => {
		const result = await Promise.resolve("test");
		expect(result).toBe("test");
	});
});
