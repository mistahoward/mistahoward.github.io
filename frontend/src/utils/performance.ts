// Performance monitoring utility
export class PerformanceMonitor {
	private static instance: PerformanceMonitor;
	private metrics: Map<string, number[]> = new Map();
	private isEnabled: boolean = false;

	private constructor() {
		// Enable in development mode
		this.isEnabled = import.meta.env.DEV;
	}

	static getInstance(): PerformanceMonitor {
		if (!PerformanceMonitor.instance) {
			PerformanceMonitor.instance = new PerformanceMonitor();
		}
		return PerformanceMonitor.instance;
	}

	startTimer(label: string): () => void {
		if (!this.isEnabled) return () => { };

		const start = performance.now();
		return () => {
			const duration = performance.now() - start;
			this.recordMetric(label, duration);
		};
	}

	recordMetric(label: string, value: number): void {
		if (!this.isEnabled) return;

		if (!this.metrics.has(label)) {
			this.metrics.set(label, []);
		}
		this.metrics.get(label)!.push(value);

		// Keep only last 100 measurements
		const measurements = this.metrics.get(label)!;
		if (measurements.length > 100) {
			measurements.splice(0, measurements.length - 100);
		}

		// Log slow operations
		if (value > 100) { // 100ms threshold
			console.warn(`Slow operation detected: ${label} took ${value.toFixed(2)}ms`);
		}
	}

	getMetrics(label?: string): { [key: string]: { avg: number; min: number; max: number; count: number } } {
		const result: { [key: string]: { avg: number; min: number; max: number; count: number } } = {};

		if (label) {
			const measurements = this.metrics.get(label);
			if (measurements && measurements.length > 0) {
				result[label] = this.calculateStats(measurements);
			}
		} else {
			for (const [key, measurements] of this.metrics.entries()) {
				if (measurements.length > 0) {
					result[key] = this.calculateStats(measurements);
				}
			}
		}

		return result;
	}

	private calculateStats(measurements: number[]): { avg: number; min: number; max: number; count: number } {
		const sum = measurements.reduce((a, b) => a + b, 0);
		const avg = sum / measurements.length;
		const min = Math.min(...measurements);
		const max = Math.max(...measurements);
		const count = measurements.length;

		return { avg, min, max, count };
	}

	clearMetrics(): void {
		this.metrics.clear();
	}

	enable(): void {
		this.isEnabled = true;
	}

	disable(): void {
		this.isEnabled = false;
	}

	// Memory usage monitoring
	getMemoryUsage(): { used: number; total: number; percentage: number } | null {
		if (!this.isEnabled || !("memory" in performance)) return null;

		const memory = (performance as any).memory;
		const used = memory.usedJSHeapSize;
		const total = memory.totalJSHeapSize;
		const percentage = (used / total) * 100;

		return { used, total, percentage };
	}

	// Log memory warning if usage is high
	checkMemoryUsage(): void {
		if (!this.isEnabled) return;

		const memory = this.getMemoryUsage();
		if (memory && memory.percentage > 80) {
			const usedMB = (memory.used / 1024 / 1024).toFixed(1);
			const totalMB = (memory.total / 1024 / 1024).toFixed(1);
			console.warn(`High memory usage detected: ${memory.percentage.toFixed(1)}% (${usedMB}MB / ${totalMB}MB)`);
		}
	}
}

// Convenience functions
export const perf = PerformanceMonitor.getInstance();

export const measureTime = <T>(label: string, fn: () => T): T => {
	const endTimer = perf.startTimer(label);
	try {
		return fn();
	} finally {
		endTimer();
	}
};

export const measureAsyncTime = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
	const endTimer = perf.startTimer(label);
	try {
		return await fn();
	} finally {
		endTimer();
	}
}; 