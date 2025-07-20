import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";

// Firebase configuration - these will come from environment variables
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// GitHub auth provider
const githubProvider = new GithubAuthProvider();
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");

// Helper function to extract GitHub username from Firebase user
export const extractGitHubUsername = (user: User): string => {
	// Try to get from display name first (most reliable for GitHub users)
	if (user.displayName && !user.displayName.includes(" ") && !user.displayName.includes("@")) {
		return user.displayName;
	}

	// Try to get from email (GitHub format: username@users.noreply.github.com)
	if (user.email && user.email.includes("@users.noreply.github.com")) {
		return user.email.split("@")[0];
	}

	// Try to get from photo URL (GitHub avatar URLs contain username)
	if (user.photoURL && user.photoURL.includes("githubusercontent.com")) {
		const urlParts = user.photoURL.split("/");
		// Look for the 'u' path which contains the username
		const uIndex = urlParts.findIndex(part => part === "u");
		if (uIndex > 0 && uIndex + 1 < urlParts.length) {
			const potentialUsername = urlParts[uIndex + 1];
			// Remove query parameters if present
			return potentialUsername.split("?")[0];
		}
	}

	// Try to get from provider data
	if (user.providerData && user.providerData.length > 0) {
		const githubProvider = user.providerData.find(provider => provider.providerId === "github.com");
		if (githubProvider && githubProvider.uid) {
			return githubProvider.uid;
		}
	}

	return "";
};

// Function to get GitHub username from GitHub API using user ID
export const getGitHubUsernameFromId = async (userId: string): Promise<string> => {
	try {
		const response = await fetch(`https://api.github.com/user/${userId}`);
		if (response.ok) {
			const data = await response.json();
			return data.login || "";
		}
	} catch (error) {
		console.error("Error fetching GitHub username:", error);
	}
	return "";
};

// Enhanced function to get GitHub username with API fallback
export const getGitHubUsername = async (user: User): Promise<string> => {
	// First try to extract from user data
	const username = extractGitHubUsername(user);

	// If we got a numeric ID from the photo URL, try to get the actual username from GitHub API
	if (username && /^\d+$/.test(username)) {
		console.log("Found GitHub user ID, fetching username from API:", username);
		const actualUsername = await getGitHubUsernameFromId(username);
		if (actualUsername) {
			console.log("Got GitHub username from API:", actualUsername);
			return actualUsername;
		}
	}

	return username;
};

// Authentication functions
export const signInWithGitHub = async () => {
	try {
		const result = await signInWithPopup(auth, githubProvider);
		console.log("Firebase auth result:", result);
		console.log("User object:", result.user);
		console.log("Provider data:", result.user.providerData);

		const githubUsername = extractGitHubUsername(result.user);
		console.log("Extracted GitHub username:", githubUsername);

		return result.user;
	} catch (error) {
		console.error("Error signing in with GitHub:", error);
		throw error;
	}
};

export const signOutUser = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error("Error signing out:", error);
		throw error;
	}
};

export const getCurrentUser = (): User | null => {
	return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
	return onAuthStateChanged(auth, callback);
};

// Get ID token for API requests
export const getIdToken = async (): Promise<string | null> => {
	const user = auth.currentUser;
	if (!user) return null;

	try {
		return await user.getIdToken();
	} catch (error) {
		console.error("Error getting ID token:", error);
		return null;
	}
};

export { auth, app }; 