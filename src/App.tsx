import { Container, Row } from 'react-bootstrap';
import Header from './ui/Header';
import Body from './ui/Body';
import Footer from './ui/Footer';

function App(): JSX.Element {
	return (
		<Container>
			<Row>
				<Header />
			</Row>
			<Row>
				<Body />
			</Row>
			<Row>
				<Footer />
			</Row>
		</Container>
	);
}

export default App;
