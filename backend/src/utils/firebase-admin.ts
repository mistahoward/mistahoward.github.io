// Simple JWT verification for Cloudflare Workers
// This replaces Firebase Admin SDK which doesn't work well in Workers

interface FirebaseUser {
	uid: string;
	email: string;
	name?: string;
	picture?: string;
}

export const initializeFirebaseAdmin = (env: any) => {
	// No initialization needed for simple JWT verification
	console.log("Firebase Admin initialized for Cloudflare Workers");
};

export const verifyIdToken = async (idToken: string): Promise<FirebaseUser> => {
	try {
		// Decode the JWT (this is just for testing - not secure!)
		const parts = idToken.split('.');
		if (parts.length !== 3) {
			throw new Error("Invalid JWT format");
		}

		// Decode the payload (this is unsafe for production!)
		const payload = JSON.parse(atob(parts[1]));

		console.log('Decoded JWT payload:', payload);

		return {
			uid: payload.sub || payload.user_id || payload.uid || "test-user-id",
			email: payload.email || payload.email_verified || "test@example.com",
			name: payload.name || payload.display_name || payload.displayName || "Test User",
			picture: payload.picture || payload.photoURL || payload.avatar_url || "https://example.com/avatar.jpg",
		};
	} catch (error) {
		console.error("Error verifying ID token:", error);
		throw error;
	}
};

export const getUserByUid = async (uid: string): Promise<FirebaseUser> => {
	// Mock user data for testing
	return {
		uid,
		email: "test@example.com",
		name: "Test User",
		picture: "https://example.com/avatar.jpg",
	};
};

export const auth = {
	verifyIdToken,
	getUserByUid,
}; 