import { Row, Col } from 'react-bootstrap';
import '../assets/css/header.css';

function Header(): JSX.Element {
	return (
		<Col id="main-nav">
			<Row>
				<Col>Home</Col>
				<Col>About Me</Col>
				<Col><h1 className="display-6">AH</h1></Col>
				<Col>Portfolio</Col>
				<Col>Dark Mode Toggle</Col>
			</Row>
		</Col>
	);
}

export default Header;
