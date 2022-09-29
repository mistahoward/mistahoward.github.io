import { useTitle } from 'hookrouter';
import '../assets/css/about.css';

function About(): JSX.Element {
	useTitle('About | Alex Howard');
	return (
		<>
			<div>About</div>
			<div>two</div>
		</>
	);
}

export default About;
