# Resume sync

Keeps `frontend/public/resume.pdf` (served at `https://jayhoward.dev/resume.pdf`) in step with the resume Google Doc. A Google Apps Script in the Doc owner's account checks the Doc about once an hour. If the Doc was edited, it exports it as a PDF and commits it to `main` as `content: sync resume from Google Doc`, and Cloudflare Pages redeploys the site. The Doc stays private, and every published version is kept in git history.

- **Publishes only after a change.** PDF exports differ byte for byte every time, so the script compares the Doc's last-updated time with the one it stored at the last publish.
- **Waits out edits.** An hourly run publishes only once the Doc has gone 10 minutes without an edit, so an edit is live within about 70 minutes. `runNow` publishes right away.
- **Everything saved in the Doc goes public**, and stays in this repo's history. Draft in a copy.
- **Hands off `resume.pdf`.** The script owns that file now. Don't commit it by hand.

`Code.gs` and `appsscript.json` in this folder are the source. When they change here, paste them into the Apps Script project again.

## One-time setup

### 1. Create the GitHub token

On GitHub, go to **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**:

| Field | Value |
|---|---|
| Token name | `mistahoward.github.io resume-sync` |
| Resource owner | `mistahoward` |
| Description | `Lets the resume-sync Apps Script commit frontend/public/resume.pdf` |
| Expiration | No expiration |
| Repository access | Only select repositories: `mistahoward/mistahoward.github.io` |
| Repository permissions | **Contents: Read and write**. GitHub adds Metadata: Read-only on its own. Nothing else |

Copy the token. It goes in step 4 and nowhere else.

### 2. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com), signed in as the Doc's owner, and click **New project**.
2. Rename it from "Untitled project" to `resume-sync`.
3. Replace everything in `Code.gs` with this folder's [`Code.gs`](Code.gs), then save (Ctrl+S).

### 3. Narrow its Google permissions

Without this step, Apps Script asks for full edit access to your Drive. With it, the script can only read Drive and make web requests.

1. Open **Project Settings** (the gear icon) and tick **Show "appsscript.json" manifest file in editor**.
2. Back in the **Editor** (`<>`), open `appsscript.json`, replace all of its contents with this folder's [`appsscript.json`](appsscript.json), and save.

### 4. Set the Script Properties

In **Project Settings > Script Properties**, add these two, then click **Save script properties**:

| Property | Value |
|---|---|
| `GITHUB_TOKEN` | The token from step 1 |
| `DOC_ID` | `1N7uYrkjQeoRHSNkjXQ0UIVwles90gk3GeZvi1LkNt0A` (Resume 2026.11 - 1) |

### 5. Authorize, and publish once by hand

1. In the Editor, choose `runNow` in the function menu at the top and click **Run**.
2. Google asks for permission. Pick your account. You'll see **Google hasn't verified this app**, because the project is your own and unpublished: click **Advanced > Go to resume-sync (unsafe)**, then **Allow**. It asks to see and download your Drive files and to connect to an external service.
3. The execution log should end with a line like `[resume-sync] runNow: published "Resume 2026.11 - 1" (…): https://github.com/mistahoward/mistahoward.github.io/commit/…`.

### 6. Add the hourly trigger

Open **Triggers** (the alarm-clock icon), click **Add Trigger**, set the fields below, and click **Save**:

| Field | Value |
|---|---|
| Function to run | `syncResume` |
| Deployment | Head |
| Event source | Time-driven |
| Type of time-based trigger | Hour timer |
| Hour interval | Every hour |
| Failure notification | Notify me immediately |

### 7. Check it worked

- `main` has the new commit, and the Cloudflare Pages check on it passes.
- After the build finishes (a minute or two), `https://jayhoward.dev/resume.pdf` shows the Doc. Hard-refresh if your browser cached the old one.
- Each run's line shows under **Executions** (the list icon).

## Day to day

| To… | Do this |
|---|---|
| Publish an edit now | Run `runNow` |
| Switch to a new resume Doc | Change `DOC_ID` in Script Properties. The next run publishes the new Doc |
| Put the Doc back after `resume.pdf` was changed in git | Run `forceSync` |
| Rotate the token | Make one with the step 1 settings, paste it over `GITHUB_TOKEN`, then delete the old one on GitHub |
| Pause syncing | Delete the trigger. Add it again (step 6) to resume |

## When a run fails

The failure email and the log line say what went wrong:

- **HTTP 401:** the token is wrong or expired. Replace it.
- **HTTP 403 or 404:** the token is missing this repo or Contents: Read and write. Fix it in the token's settings on GitHub.
- **HTTP 409:** `main` changed during the commit. The next run tries again.
- **"You do not have permission to call …":** Google wants a scope that isn't in `appsscript.json`. Add the scope the message names, save, and run `runNow` to authorize it.
- **No commit after an edit:** check Executions. An hourly run waits until the Doc has gone 10 minutes without an edit, so give it up to about 70 minutes, or run `runNow`.
