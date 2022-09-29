import { useTitle } from 'hookrouter';
import '../assets/css/about.css';

function Error(): JSX.Element {
	useTitle('Error | Alex Howard');
	return (
		<>
			<div>Error</div>
			<div>two</div>
		</>
	);
}

export default Error;
