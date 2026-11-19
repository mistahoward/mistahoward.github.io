/**
 * Resume sync: publishes the resume Google Doc to the portfolio as
 * frontend/public/resume.pdf on main, so https://jayhoward.dev/resume.pdf
 * always matches the Doc.
 *
 * This runs as a Google Apps Script project in the Doc owner's own account,
 * not in this repo's build. This file is the source of truth: paste it into
 * the Apps Script editor. One-time setup is in README.md beside this file.
 *
 * Each hourly run:
 *   1. Reads the Doc's last-updated time from Drive.
 *   2. Stops if that time is no newer than the last published one (and the Doc
 *      is the same one). PDF exports differ byte for byte every time, so the
 *      Doc's time is the only reliable "did it change" signal.
 *   3. Waits for a later run if the last edit is under QUIET_MINUTES old, so a
 *      half-finished edit never goes live.
 *   4. Exports the Doc as PDF and commits it to main through the GitHub
 *      contents API. Cloudflare Pages rebuilds the site from main.
 *   5. Stores the Doc's time, so runs skip until the next edit.
 *
 * Script Properties (Project Settings > Script Properties):
 *   GITHUB_TOKEN          You set it. Fine-grained token, this repo only, Contents read and write.
 *   DOC_ID                You set it. The Doc to publish: the long id in its URL.
 *   LAST_SYNCED_MODIFIED  The script writes it: the Doc's last-updated time (ms) at the last publish.
 *   LAST_SYNCED_DOC_ID    The script writes it: the Doc published last, so switching DOC_ID publishes the new Doc.
 *
 * Every run writes one "[resume-sync]" line to the execution log. A failed run
 * also throws, so Apps Script marks it failed and emails the trigger's owner.
 */

const GITHUB_OWNER = "mistahoward";
const GITHUB_REPO = "mistahoward.github.io";
const GITHUB_BRANCH = "main";
const FILE_PATH = "frontend/public/resume.pdf";
const COMMIT_MESSAGE = "content: sync resume from Google Doc";

/** How long the Doc must go unedited before an hourly run publishes it. */
const QUIET_MINUTES = 10;

const LOG_PREFIX = "[resume-sync]";

const PROP = {
	token: "GITHUB_TOKEN",
	docId: "DOC_ID",
	lastModified: "LAST_SYNCED_MODIFIED",
	lastDocId: "LAST_SYNCED_DOC_ID",
};

/** Entry point for the hourly time-driven trigger. */
function syncResume() {
	sync_({ source: "trigger", waitForQuiet: true, force: false });
}

/**
 * Run by hand to publish right away. It skips the quiet period, but still
 * publishes only when the Doc changed since the last publish.
 */
function runNow() {
	sync_({ source: "runNow", waitForQuiet: false, force: false });
}

/**
 * Run by hand to publish the Doc even though it hasn't changed, for example
 * after someone overwrote resume.pdf in git.
 */
function forceSync() {
	sync_({ source: "forceSync", waitForQuiet: false, force: true });
}

/**
 * Checks the Doc and publishes it when needed.
 * @param {{source: string, waitForQuiet: boolean, force: boolean}} opts
 */
function sync_(opts) {
	const tag = `${LOG_PREFIX} ${opts.source}:`;

	// A trigger run and a manual run at the same moment would race for the
	// same file sha on GitHub. Let one finish and skip the other.
	const lock = LockService.getScriptLock();
	if (!lock.tryLock(30 * 1000)) {
		console.log(`${tag} skipped, another run is still going`);
		return;
	}

	try {
		const props = PropertiesService.getScriptProperties();
		const token = requireProp_(props, PROP.token);
		const docId = requireProp_(props, PROP.docId);

		// Read the time before exporting. If an edit lands during the export,
		// the stored time is older than that edit, so the next run publishes again.
		const file = DriveApp.getFileById(docId);
		const modified = file.getLastUpdated();
		const lastModified = Number(props.getProperty(PROP.lastModified) || 0);
		const sameDoc = props.getProperty(PROP.lastDocId) === docId;

		if (!opts.force && sameDoc && modified.getTime() <= lastModified) {
			console.log(`${tag} no change, Doc last edited ${modified.toISOString()}`);
			return;
		}

		const idleMinutes = Math.floor((Date.now() - modified.getTime()) / 60000);
		if (opts.waitForQuiet && idleMinutes < QUIET_MINUTES) {
			console.log(`${tag} Doc edited ${idleMinutes} min ago, waiting until it has sat ${QUIET_MINUTES} min`);
			return;
		}

		const bytes = file.getAs("application/pdf").getBytes();
		const commitUrl = commitFile_(token, bytes);

		props.setProperties({
			[PROP.lastModified]: String(modified.getTime()),
			[PROP.lastDocId]: docId,
		});
		const kb = Math.round(bytes.length / 1024);
		console.log(`${tag} published "${file.getName()}" (edited ${modified.toISOString()}, ${kb} KB): ${commitUrl}`);
	} catch (err) {
		console.error(`${tag} failed: ${err && err.message ? err.message : err}`);
		throw err;
	} finally {
		lock.releaseLock();
	}
}

/**
 * Commits the PDF to FILE_PATH on GITHUB_BRANCH.
 * @param {string} token Fine-grained GitHub token.
 * @param {number[]} bytes The PDF.
 * @return {string} The new commit's GitHub URL.
 */
function commitFile_(token, bytes) {
	const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
	const headers = {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};

	// Replacing a file needs the sha of the copy on the branch now.
	// A 404 means the file isn't there yet, and the PUT creates it.
	const current = UrlFetchApp.fetch(`${url}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers, muteHttpExceptions: true });
	let sha;
	if (current.getResponseCode() === 200) {
		sha = JSON.parse(current.getContentText()).sha;
	} else if (current.getResponseCode() !== 404) {
		throw githubError_("reading the current resume.pdf", current);
	}

	const res = UrlFetchApp.fetch(url, {
		method: "put",
		contentType: "application/json",
		headers,
		payload: JSON.stringify({
			message: COMMIT_MESSAGE,
			content: Utilities.base64Encode(bytes),
			sha, // left out of the JSON when undefined
			branch: GITHUB_BRANCH,
		}),
		muteHttpExceptions: true,
	});
	if (res.getResponseCode() !== 200 && res.getResponseCode() !== 201) {
		throw githubError_("committing resume.pdf", res);
	}
	return JSON.parse(res.getContentText()).commit.html_url;
}

/**
 * Turns a failed GitHub response into an Error that says what to do.
 * Never includes the token: GitHub doesn't echo it back.
 */
function githubError_(step, res) {
	const code = res.getResponseCode();
	let detail = res.getContentText().slice(0, 300);
	try {
		detail = JSON.parse(res.getContentText()).message || detail;
	} catch (e) {
		// Not JSON. Keep the raw text.
	}
	const hints = {
		401: "The token is wrong or expired. Make a new one (README, step 1) and paste it over GITHUB_TOKEN.",
		403: `The token can't write here. It needs access to ${GITHUB_OWNER}/${GITHUB_REPO} with Contents set to Read and write.`,
		404: `The token can't see ${GITHUB_OWNER}/${GITHUB_REPO}. Check its repository access.`,
		409: "main moved during the commit. The next run tries again.",
	};
	return new Error(`GitHub error ${step} (HTTP ${code}): ${detail}. ${hints[code] || ""}`.trim());
}

function requireProp_(props, name) {
	const value = (props.getProperty(name) || "").trim();
	if (!value) {
		throw new Error(`Script Property ${name} isn't set. See README, step 4.`);
	}
	return value;
}
