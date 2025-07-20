describe("Basic Test Setup", () => {
	it("should run basic tests", () => {
		expect(true).toBe(true);
		expect(1 + 1).toBe(2);
	});

	it("should handle async operations", async () => {
		const result = await Promise.resolve("test");
		expect(result).toBe("test");
	});

	it("should handle DOM operations", () => {
		const element = document.createElement("div");
		element.textContent = "Hello World";
		expect(element.textContent).toBe("Hello World");
	});
}); 