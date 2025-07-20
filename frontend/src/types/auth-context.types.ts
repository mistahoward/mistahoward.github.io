import { User } from "firebase/auth";

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: () => Promise<void>;
	signOut: () => Promise<void>;
} 