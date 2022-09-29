import { Row, Col } from 'react-bootstrap';
import { DefaultTheme } from 'styled-components';
import { BsFillSunFill, BsFillMoonFill } from 'react-icons/bs';
import { navigate, usePath } from 'hookrouter';
import '../assets/css/header.css';
import { lightTheme } from './Theme';

type HeaderProps = {
	themeToggle: () => void;
	theme: DefaultTheme;
};

function Header({ themeToggle, theme }: HeaderProps): JSX.Element {
	const currentPath = usePath();

	return (
		<Col id="main-nav">
			<Row>
				<Col className="text-center" onClick={() => navigate('/')}>
					<span className={`header-link ${currentPath === '/' && 'selected'}`}>Home</span>
				</Col>
				<Col className="text-center" onClick={() => navigate('/about')}>
					<span className={`header-link ${currentPath === '/about' && 'selected'}`}>About Me</span>
				</Col>
				<Col className="text-center" onClick={() => navigate('/')}>
					<h1 className="display-6">
						<span className="header-link">AH</span>
					</h1>
				</Col>
				<Col className="text-center" onClick={() => navigate('/portfolio')}>
					<span className={`header-link ${currentPath === '/portfolio' && 'selected'}`}>Portfolio</span>
				</Col>
				<Col
					className="text-center"
					onClick={() => {
						themeToggle();
					}}
				>
					<span className="header-link">
						{theme === lightTheme ? <BsFillSunFill /> : <BsFillMoonFill />}
					</span>
				</Col>
			</Row>
		</Col>
	);
}

export default Header;
