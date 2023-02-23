import '../assets/css/footer.css';
import { Row, Col } from 'react-bootstrap';

const Footer = (): JSX.Element => (
	<div id="footer">
		<Row>
			<Col className="text-center text-muted">Made with ♡ by Alex</Col>
		</Row>
		<Row>
			<Col className="text-center text-muted">© 2022</Col>
		</Row>
	</div>
);

export default Footer;
