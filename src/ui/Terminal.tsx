import React from 'react';
import '../assets/css/terminal.css';

type TerminalProps = {
	line1: string;
	line2?: string;
	line3?: string;
	line4?: string;
	className?: string;
};

export default function Terminal({
	line1,
	line2,
	line3,
	line4,
	className = 'terminal'
}: TerminalProps): JSX.Element {
	return (
		<div className={className}>
			<div className="bar">
				<div className="buttons close" />
				<div className="buttons minimize" />
				<div className="buttons maximize" />
			</div>
			<div className="window">
				<p className="line1">
					{line1}
				</p>
				{line2 && (
					<p className="line2">
						{line2}
					</p>
				)}
				{line3 && (
					<p className="line3">
						{line3}
					</p>
				)}
				{line4 && (
					<p className="line4">
						{line4}
					</p>
				)}
			</div>
		</div>
	);
}
