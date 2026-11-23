/** Longest side, in pixels, of a pet photo after it's shrunk. */
export const PHOTO_MAX_EDGE = 1200;
/** JPEG quality used when a pet photo is re-encoded. */
export const PHOTO_QUALITY = 0.82;
/** A photo already within PHOTO_MAX_EDGE and under this size uploads as-is. */
export const PHOTO_SKIP_BYTES = 400 * 1024;

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
	new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality));

/**
 * Shrinks a photo before upload: at most PHOTO_MAX_EDGE px on its longest side, re-encoded
 * as JPEG, which also drops its EXIF metadata (location included). Phone photos keep their
 * rotation. Returns the original file when it's already small, when the result wouldn't be
 * smaller, or when anything fails. Only for photos: resampling would blur pixel-art icons.
 */
export const shrinkPhoto = async (file: File): Promise<File> => {
	let bitmap: ImageBitmap | undefined;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
		const { width, height } = bitmap;
		const longest = Math.max(width, height);
		if (longest <= PHOTO_MAX_EDGE && file.size <= PHOTO_SKIP_BYTES) return file;

		const scale = Math.min(1, PHOTO_MAX_EDGE / longest);
		const canvas = document.createElement("canvas");
		canvas.width = Math.max(1, Math.round(width * scale));
		canvas.height = Math.max(1, Math.round(height * scale));
		const ctx = canvas.getContext("2d");
		if (!ctx) return file;

		// JPEG has no transparency, so a see-through PNG gets white behind it instead of black.
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.imageSmoothingQuality = "high";
		ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

		const blob = await canvasToBlob(canvas, "image/jpeg", PHOTO_QUALITY);
		if (!blob || blob.size >= file.size) return file;

		const baseName = file.name.replace(/\.[^.]*$/, "") || "photo";
		return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
	} catch (err) {
		console.warn("Couldn't shrink the photo, uploading the original", err);
		return file;
	} finally {
		bitmap?.close();
	}
};
