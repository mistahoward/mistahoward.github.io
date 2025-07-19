import { useState, useEffect } from "preact/hooks";
import { perf } from "../../../utils/performance";

interface MemoryMonitorProps {
	showDetails?: boolean;
}

export const MemoryMonitor = ({ showDetails = false }: MemoryMonitorProps) => {
	const [memoryInfo, setMemoryInfo] = useState<{
		used: number;
		total: number;
		percentage: number;
	} | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const updateMemoryInfo = () => {
			const memory = perf.getMemoryUsage();
			setMemoryInfo(memory);
		};

		// Update immediately
		updateMemoryInfo();

		// Update every 5 seconds
		const interval = setInterval(updateMemoryInfo, 5000);

		return () => clearInterval(interval);
	}, []);

	if (!memoryInfo) return null;

	const { used, total, percentage } = memoryInfo;
	const usedMB = (used / 1024 / 1024).toFixed(1);
	const totalMB = (total / 1024 / 1024).toFixed(1);

	// Determine color based on memory usage
	let colorClass = "text-success";
	if (percentage > 80) colorClass = "text-danger";
	else if (percentage > 60) colorClass = "text-warning";

	return (
		<div className="memory-monitor">
			{showDetails ? (
				<div className={`card ${colorClass.replace("text-", "border-")}`}>
					<div className="card-body p-2">
						<div className="d-flex justify-content-between align-items-center">
							<small className={colorClass}>
								<strong>Memory:</strong> {usedMB}MB / {totalMB}MB ({percentage.toFixed(1)}%)
							</small>
							<button className="btn btn-sm btn-outline-secondary" onClick={() => setIsVisible(!isVisible)}>
								{isVisible ? "Hide" : "Show"} Details
							</button>
						</div>
						{isVisible && (
							<div className="mt-2">
								<div className="progress" style={{ height: "0.5rem" }}>
									<div
										className={`progress-bar ${
											percentage > 80 ? "bg-danger" : percentage > 60 ? "bg-warning" : "bg-success"
										}`}
										style={{ width: `${percentage}%` }}
									/>
								</div>
								<small className="text-muted">
									{percentage > 80 && "⚠️ High memory usage detected"}
									{percentage > 60 && percentage <= 80 && "⚠️ Moderate memory usage"}
									{percentage <= 60 && "✅ Memory usage normal"}
								</small>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className={`badge ${colorClass.replace("text-", "bg-")} text-white`}>
					{percentage.toFixed(0)}% ({usedMB}MB)
				</div>
			)}
		</div>
	);
};
