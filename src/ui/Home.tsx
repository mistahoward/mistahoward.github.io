import { useTitle } from 'hookrouter';
import '../assets/css/home.css';

function Home(): JSX.Element {
	useTitle('Home | Alex Howard');
	return (
		<>
			<div>Home</div>
			<div>two</div>
		</>
	);
}

export default Home;
