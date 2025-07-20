// Backend-specific setup for Jest tests
// This file is used for backend tests that run in Node.js environment

// Mock Cloudflare Workers environment
global.Response = Response as any;
global.Request = Request as any;
global.Headers = Headers as any;
global.URL = URL as any;

// Mock console methods to reduce noise in tests
global.console = {
	...console,
	log: jest.fn(),
	debug: jest.fn(),
	info: jest.fn(),
	warn: jest.fn(),
	error: jest.fn(),
};

// Mock environment variables
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.FIREBASE_CLIENT_EMAIL = "test@test.com";
process.env.FIREBASE_PRIVATE_KEY = "test-key";

// Mock D1 database
global.DB = {} as any; 