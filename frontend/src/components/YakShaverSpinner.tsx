import "../assets/yak-shaver-spinner.scss";

export const YakShaverSpinner = () => {
	return (
		<div className="yak-shaver-spinner d-flex align-items-center justify-content-center">
			<span className="yak" role="img" aria-label="yak">
				🦬
			</span>
			<span className="razor" role="img" aria-label="razor">
				🪒
			</span>
		</div>
	);
};
