import { Container, Row } from 'react-bootstrap';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import { useState, useCallback } from 'react';
import { lightTheme, darkTheme } from './ui/Theme';
import Header from './ui/Header';
import Body from './ui/Body';
import About from './ui/About';
import Home from './ui/Home';
import Portfolio from './ui/Portfolio';
import Footer from './ui/Footer';
import GlobalStyles from './ui/globalStyles';

function App(): JSX.Element {
	const [theme, setSelectedTheme] = useState<DefaultTheme>(lightTheme);
	const themeToggler = () => {
		theme === lightTheme ? setSelectedTheme(darkTheme) : setSelectedTheme(lightTheme);
	};

	const routes = {
		'/': useCallback(() => <Home />, []),
		'/about': useCallback(() => <About />, []),
		'/portfolio': useCallback(() => <Portfolio />, [])
	};

	return (
		<ThemeProvider theme={theme === lightTheme ? lightTheme : darkTheme}>
			<GlobalStyles />
			<Container>
				<Row>
					<Header themeToggle={themeToggler} theme={theme} />
				</Row>
				<Row>
					<Body routes={routes} />
				</Row>
				<Row>
					<Footer />
				</Row>
			</Container>
		</ThemeProvider>
	);
}

export default App;
