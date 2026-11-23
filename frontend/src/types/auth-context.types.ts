import { User } from "firebase/auth";

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	/** False when Firebase isn't configured for this build, so nobody can sign in. */
	available: boolean;
	signIn: () => Promise<void>;
	signOut: () => Promise<void>;
} 