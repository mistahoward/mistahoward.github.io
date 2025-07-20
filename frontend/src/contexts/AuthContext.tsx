import { createContext, useContext, useEffect, useState, type ReactNode } from "preact/compat";
import { User } from "firebase/auth";
import { onAuthStateChange, signInWithGitHub, signOutUser } from "../utils/firebase";
import { AuthContextType } from "../types/auth-context.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChange(user => {
			setUser(user);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const signIn = async () => {
		try {
			await signInWithGitHub();
		} catch (error) {
			console.error("Sign in error:", error);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			await signOutUser();
		} catch (error) {
			console.error("Sign out error:", error);
			throw error;
		}
	};

	const value: AuthContextType = {
		user,
		loading,
		signIn,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
