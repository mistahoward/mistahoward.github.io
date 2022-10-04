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
			<div className="fakeMenu">
				<div className="fakeButtons fakeClose" />
				<div className="fakeButtons fakeMinimize" />
				<div className="fakeButtons fakeZoom" />
			</div>
			<div className="fakeScreen">
				<p className="line1">
					{line1}
					<span className="cursor1">_</span>
				</p>
				{line2 && (
					<p className="line2">
						{line2}
						<span className="cursor2">_</span>
					</p>
				)}
				{line3 && (
					<p className="line3">
						{line3}
						<span className="cursor3">_</span>
					</p>
				)}
				{line4 && (
					<p className="line4">
						{line4}
						<span className="cursor4">_</span>
					</p>
				)}
			</div>
		</div>
	);
}
