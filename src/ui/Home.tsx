import { useTitle } from 'hookrouter';
import { Row, Col } from 'react-bootstrap';
import Lottie from 'lottie-react';
import {
	FiGithub, FiLinkedin, FiTwitter, FiMail
} from 'react-icons/fi';
import Headshot from '../assets/img/headshot.png';
import wave from '../assets/animations/wave.json';
import '../assets/css/home.css';

const Home = (): JSX.Element => {
	useTitle('Home | Alex Howard');
	return (
		<Row id="home">
			<Col>
				<Row className="g-0">
					<Col lg={1} xl={2} />
					<Col sm={12} md={6} lg={4} xl={3} className="mb-3 portrait-container">
						<Lottie id="wave" animationData={wave} loop />
						<img id="portrait" src={Headshot} alt="Portrait of Alex Howard" />
					</Col>
					<Col sm={12} md={6} lg={6} xl={7} className="text-center text-md-start">
						<Row className="g-0">
							<Col>
								<h1 className="display-4 text-nowrap">
									Hey! I&rsquo;m
									{' '}
									<span className="main-color">
										Alex
									</span>
									.
									{' '}
									<span id="hand-wave">👋🏻</span>
								</h1>
							</Col>
						</Row>
						<Row>
							<Col>
								<h1 className="display-6 text-nowrap">Front End Developer</h1>
							</Col>
						</Row>
						<Row className="larger-text text-muted g-0 justify-content-center">
							<Col xs={8} md={12}>
								<Row>
									<Col xs={2}>
										🥤
									</Col>
									<Col xs={10} className="text-nowrap">
										Fueled By Bubly Bounce
									</Col>
								</Row>
							</Col>
						</Row>
						<Row className="larger-text text-muted g-0 justify-content-center">
							<Col xs={8} md={12}>
								<Row>
									<Col xs={2}>
										🇺🇸
									</Col>
									<Col xs={10} className="text-nowrap">
										Located in Missouri
									</Col>
								</Row>
							</Col>
						</Row>
						<Row className="larger-text text-muted g-0 justify-content-center">
							<Col xs={8} md={12}>
								<Row>
									<Col xs={2}>
										💼
									</Col>
									<Col xs={10} className="text-nowrap">
										Dev at
										{' '}
										<a target="_blank" aria-label="PowerShades Home Page" rel="noreferrer" href="http://powershades.com/">PowerShades</a>
									</Col>
								</Row>
							</Col>
						</Row>
						<Row className="display-6 mt-2 g- justify-content-center justify-content-lg-start">
							<Col sm={10} md={12} lg={8} xl={7}>
								<Row className="g-0">
									<Col>
										<a target="_blank" aria-label="Alex Howard's Github" rel="noreferrer" href="https://github.com/mistahoward"><FiGithub className="link" /></a>
									</Col>
									<Col>
										<a target="_blank" aria-label="Alex Howard's LinkedIn" rel="noreferrer" href="https://www.linkedin.com/in/jalexhoward/"><FiLinkedin className="link" /></a>
									</Col>
									<Col>
										<a target="_blank" aria-label="Alex Howard's Twitter" rel="noreferrer" href="https://twitter.com/mista_howard"><FiTwitter className="link" /></a>
									</Col>
									<Col>
										<a target="_blank" aria-label="Alex Howard's Email" rel="noreferrer" href="mailto:me@alexhoward.dev"><FiMail className="link" /></a>
									</Col>
								</Row>
							</Col>
						</Row>
					</Col>
				</Row>
			</Col>
		</Row>
	);
};

export default Home;
