import { Row, Col } from 'react-bootstrap';
import { DefaultTheme } from 'styled-components';
import { BsFillSunFill, BsFillMoonFill } from 'react-icons/bs';
import '../assets/css/header.css';
import { lightTheme } from './Theme';

type HeaderProps = {
	themeToggle: () => void,
	theme: DefaultTheme;
};

function Header({ themeToggle, theme }: HeaderProps): JSX.Element {
	return (
		<Col id="main-nav">
			<Row>
				<Col>Home</Col>
				<Col>About Me</Col>
				<Col>
					<h1 className="display-6">AH</h1>
				</Col>
				<Col>Portfolio</Col>
				<Col
					onClick={() => {
						themeToggle();
					}}
				>
					{theme === lightTheme ? <BsFillSunFill /> : <BsFillMoonFill />}
				</Col>
			</Row>
		</Col>
	);
}

export default Header;
