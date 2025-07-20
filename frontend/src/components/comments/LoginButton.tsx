import { useAuth } from "../../contexts/AuthContext";

export const LoginButton = () => {
	const { signIn } = useAuth();

	const handleLogin = async () => {
		try {
			await signIn();
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<button onClick={handleLogin} className="btn btn-primary d-flex align-items-center gap-2 mx-auto">
			<i className="fab fa-github"></i>
			Sign in with GitHub
		</button>
	);
};
