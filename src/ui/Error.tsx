import { useTitle } from 'hookrouter';
import '../assets/css/about.css';

const Error = (): JSX.Element => {
	useTitle('Error | Alex Howard');
	return (
		<>
			<div>404</div>
			<div>Page not found</div>
		</>
	);
};

export default Error;
