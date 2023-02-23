import { useTitle } from 'hookrouter';
import { Row, Col } from 'react-bootstrap';
import Lottie from 'lottie-react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { useCallback, useContext } from 'react';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadFull } from 'tsparticles';
import { ThemeContext } from 'styled-components';

import planet1 from '../assets/animations/planet1.json';
import planet2 from '../assets/animations/planet2.json';
import planet3 from '../assets/animations/planet3.json';
import planet4 from '../assets/animations/planet4.json';
import planet5 from '../assets/animations/planet5.json';
import satelite from '../assets/animations/satelite.json';
import ship1 from '../assets/animations/ship1.json';

import Terminal from './Terminal';

import '../assets/css/about.css';

const About = (): JSX.Element => {
	useTitle('About | Alex Howard');
	const theme = useContext(ThemeContext);

	const particlesInit = useCallback(async (engine: Engine) => {
		await loadFull(engine);
	}, []);

	return (
		<Parallax id="about" pages={3}>
			<ParallaxLayer offset={0} speed={0.25}>
				<Particles
					className="stars"
					options={{
						fullScreen: false,
						preset: 'stars',
						detectRetina: true,
						particles: {
							color: {
								value: theme.text,
							},
						},
					}}
					id="tsparticles"
					height="350vh"
					init={particlesInit}
				/>
			</ParallaxLayer>
			<ParallaxLayer offset={0} speed={3}>
				<Row id="planet1">
					<Col xs={{ span: 12, offset: 5 }}>
						<Lottie animationData={planet4} />
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={0} speed={0.25}>
				<Row id="ship1">
					<Col xs={{ span: 3, offset: 3 }}>
						<Lottie animationData={ship1} />
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={0} speed={2}>
				<Row className="justify-content-center">
					<Col xs={12}>
						<Terminal
							line1="Hi! I'm Alex... You may have known that already, though!"
							line2="I'm a developer located in Joplin, Missouri."
							line3="I've been extremely passionate about technology ever since I was young."
							line4="Thankfully, that passion extended into software development!"
						/>
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={1} speed={1}>
				<Row id="planet2">
					<Col xs={{ span: 12, offset: 0 }} md={{ span: 6, offset: 0 }}>
						<Lottie animationData={planet3} />
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={1} speed={0.25}>
				<Row id="planet3">
					<Col xs={{ span: 8, offset: 4 }}>
						<Lottie animationData={planet1} />
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={1} speed={2}>
				<Row className="justify-content-center">
					<Col xs={12}>
						<Terminal
							line1="I use my passion to create things that live on the internet!"
							line2="I love pushing the limits of development as I truly believe it's the future."
							line3="This means I love to create beautiful, responsive, and fast web projects! [Like this one ;)]"
							line4="Because of the excitement and passion I have for development, I'm never afraid to jump in and adopt new technologies."
						/>
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={2} speed={0.5}>
				<Row id="planet4">
					<Col xs={{ span: 3, offset: 6 }}>
						<Lottie animationData={planet2} />
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={2} speed={0.25}>
				<Row id="satelite">
					<Col xs={{ span: 4, offset: 3 }}>
						<Lottie animationData={satelite} />
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={2} speed={1}>
				<Row id="planet5" className="justify-content-center">
					<Col xs={8}>
						<Lottie animationData={planet5} />
					</Col>
				</Row>
			</ParallaxLayer>
			<ParallaxLayer offset={2} speed={2}>
				<Row className="justify-content-center">
					<Col xs={12}>
						<Terminal
							line1="... and that's how I got to where I am today!"
							line2="Besides development, I'm a simple person... I like gaming, computer science, and cats."
							line3="Like... Really like cats. Seriously. My girlfriend and I have 8."
							line4="If you're interested in reaching out to me (for development or to show me your cats!), you can reach me at me@alexhoward.dev!"
						/>
					</Col>
				</Row>
			</ParallaxLayer>
		</Parallax>
	);
};

export default About;
