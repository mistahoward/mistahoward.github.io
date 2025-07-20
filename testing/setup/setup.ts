import "@testing-library/jest-dom";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() { }
	observe() {
		return null;
	}
	unobserve() {
		return null;
	}
	disconnect() {
		return null;
	}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor() { }
	observe() {
		return null;
	}
	unobserve() {
		return null;
	}
	disconnect() {
		return null;
	}
} as any;

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: () => ({
		matches: false,
		media: "",
		onchange: null,
		addListener: () => { },
		removeListener: () => { },
		addEventListener: () => { },
		removeEventListener: () => { },
		dispatchEvent: () => { }
	})
});

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
	writable: true,
	value: () => { }
});

// Mock localStorage
const localStorageMock = {
	getItem: () => null,
	setItem: () => { },
	removeItem: () => { },
	clear: () => { },
	length: 0,
	key: () => null
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
	getItem: () => null,
	setItem: () => { },
	removeItem: () => { },
	clear: () => { },
	length: 0,
	key: () => null
};
global.sessionStorage = sessionStorageMock as any;

// Mock Cloudflare Workers environment (only for backend tests)
try {
	if (typeof Response === "undefined") {
		global.Response = Response as any;
		global.Request = Request as any;
		global.Headers = Headers as any;
		global.URL = URL as any;
	}
} catch (error) {
	// Response is not available in browser environment, skip
} 