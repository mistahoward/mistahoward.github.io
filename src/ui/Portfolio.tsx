import { useTitle } from 'hookrouter';
import { Row, Col, Card } from 'react-bootstrap';
import {
	SiTypescript,
	SiReact,
	SiRedux,
	SiDotnet,
	SiPhp,
	SiBootstrap,
	SiJavascript,
} from 'react-icons/si';

import '@egjs/react-flicking/dist/flicking.css';

import '../assets/css/portfolio.css';
import resume from '../assets/alexhoward-resume-2022.pdf';

function Portfolio(): JSX.Element {
	useTitle('Portfolio | Alex Howard');
	return (
		<Row>
			<Col xs={12} lg={7} className="p-1">
				<Card className="h-100 ms-4" id="first-card" body>
					<Row>
						<h1 className="display-6">PowerShades Dealer Portal</h1>
					</Row>
					<Row>
						<Col>
							I am currently developing the front end for internal tooling used by
							over 1800 dealers. One of the first projects I worked on was integrating
							Bootstrap in order to allow for mobile usage and faster development.
							Shortly after that I began focusing on improving development best
							practices by integrating ESlint and changelogs. While I can&lsquo;t share source
							code here, I am happy to talk about any of my experience with the development.
						</Col>
					</Row>
					<Row className="technologies">
						<Row>
							<Col>TECHNOLOGIES</Col>
						</Row>
						<Row className="icons">
							<Col>
								<SiJavascript />
								<SiTypescript />
								<SiReact />
								<SiRedux />
								<SiBootstrap />
								<SiDotnet />
								<SiPhp />
							</Col>
						</Row>
					</Row>
				</Card>
			</Col>
			<Col xs={12} lg={5}>
				<Row xs={12} className="p-1 ms-2">
					<Card body>
						<Row>
							<h1 className="display-6 small-header">Portfolio</h1>
						</Row>
						<Row>
							<Col>
								The portfolio you&lsquo;re viewing now can be found on my github
								{' '}
								<a href="https://github.com/mistahoward/mistahoward.github.io">
									here.
								</a>
								{' '}
								My resume can be downloaded
								{' '}
								<a download href={resume}>here.</a>
							</Col>
						</Row>
						<Row className="technologies">
							<Row>
								<Col>TECHNOLOGIES</Col>
							</Row>
							<Row className="icons">
								<Col>
									<SiJavascript />
									<SiTypescript />
									<SiReact />
									<SiBootstrap />
								</Col>
							</Row>
						</Row>
					</Card>
				</Row>
				<Row xs={12} className="p-1 ms-2">
					<Card body>
						<Row>
							<h1 className="display-6 small-header">More Coming Soon</h1>
						</Row>
						<Row>
							<Col>
								There will be more projects listed here soon. In the meantime, you
								can find more of my projects on my
								{' '}
								<a href="https://github.com/mistahoward">github!</a>
							</Col>
						</Row>
					</Card>
				</Row>
			</Col>
		</Row>
	);
}

export default Portfolio;
