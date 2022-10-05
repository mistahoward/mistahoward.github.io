import { Row } from 'react-bootstrap';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import { useState, useCallback } from 'react';
import Div100vh from 'react-div-100vh';

import { lightTheme, darkTheme } from './ui/Theme';
import Header from './ui/Header';
import Body from './ui/Body';
import About from './ui/About';
import Home from './ui/Home';
import Portfolio from './ui/Portfolio';
import Footer from './ui/Footer';
import GlobalStyles from './ui/globalStyles';
import './assets/css/app.css';

export const stringToTheme = (initThemeString: string) => {
	switch (initThemeString) {
		case 'light':
			return lightTheme;
		case 'dark':
			return darkTheme;
		default:
			return lightTheme;
	}
};

function App(): JSX.Element {
	const initialThemeString = localStorage.getItem('theme') ?? 'light';

	const [theme, setSelectedTheme] = useState<DefaultTheme>(stringToTheme(initialThemeString));
	const themeToggler = () => {
		theme === lightTheme ? setSelectedTheme(darkTheme) : setSelectedTheme(lightTheme);
		let stringTheme: string;
		if (theme === lightTheme) {
			stringTheme = 'dark';
		} else {
			stringTheme = 'light';
		}
		localStorage.setItem('theme', stringTheme);
	};
	const routes = {
		'/': useCallback(() => <Home />, []),
		'/about': useCallback(() => <About />, []),
		'/portfolio': useCallback(() => <Portfolio />, []),
	};

	return (
		<Div100vh>
			<ThemeProvider theme={theme === lightTheme ? lightTheme : darkTheme}>
				<GlobalStyles />
				<div id="main">
					<Row>
						<Header themeToggle={themeToggler} theme={theme} />
					</Row>
					<Row>
						<Body routes={routes} />
					</Row>
					<Footer />
				</div>
			</ThemeProvider>
		</Div100vh>
	);
}

export default App;
