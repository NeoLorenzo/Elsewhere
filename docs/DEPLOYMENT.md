# Local development and GitHub Pages

The game runs as static HTML, CSS and browser JavaScript. Local development uses the Node server; GitHub Pages serves the same game files without a Node server, installation step or game backend.

Repository: [NeoLorenzo/Elsewhere](https://github.com/NeoLorenzo/Elsewhere). The expected project-site address is [neolorenzo.github.io/Elsewhere/](https://neolorenzo.github.io/Elsewhere/). The URL becomes available after Pages is enabled and a deployment succeeds; the workflow's deployment/environment link is the source of truth for its published address.

## Work locally

From `C:\BitLife Clone` with Node.js 22 or newer:

```powershell
npm test
npm start
```

Open [localhost:3000](http://localhost:3000). The local server binds to loopback and supplies the development revision endpoint used for automatic refresh. Another port can be selected in PowerShell:

```powershell
$env:PORT = '3001'
npm start
```

Local file edits appear in the local preview. Published changes appear only after the updated source is committed, pushed to `main`, tested and successfully deployed. The hosted game does not call the local development endpoint and does not require your computer to remain online.

## Automated publication

[The Pages workflow](../.github/workflows/pages.yml) runs on pushes to `main` and supports manual dispatch from the repository's Actions tab. A manual dispatch must select `main`; other branches are deliberately skipped. Publication requires the repository's Pages publishing source to be **GitHub Actions**, with Actions and the `github-pages` environment allowed to deploy from `main`.

The workflow checks out source, selects Node.js 22 and runs `npm run check` (syntax checks plus tests). No `npm install` is needed because this game currently has no external runtime or test dependencies. If dependencies are introduced later, commit a lockfile and add the appropriate deterministic install step before tests.

`npm run build` stages the game with `scripts/build-static.mjs`. The script computes a source-content hash and versions every stylesheet/module reference and the module import graph. This prevents a newly deployed interface from loading an older cached simulation module. Local development uses the server’s revision mechanism instead.

Only these paths enter the static staging directory:

```text
_site/
  index.html
  src/
  public/
  .nojekyll
```

The repository's documentation, tests, Node server, package metadata, local saves, Git history and workflow files are not copied into the published game artifact. Browser JavaScript is necessarily public source in a static game. Keep private credentials and private data out of every published path.

The upload job creates the Pages artifact; the deployment job waits for that job to succeed and publishes to the `github-pages` environment. Failed tests prevent artifact publication. Workflow-level concurrency serialises Pages deployments without cancelling a deployment already in progress. Contents are read-only to the workflow; deployment uses Pages write and OIDC permissions. No personal access token is stored in this workflow.

Action versions were checked against official sources on 18 October 2026: checkout and setup-node v7, configure-pages v5, upload-pages-artifact v4 and deploy-pages v4. The current [GitHub Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) documents the Pages action chain, required deployment permissions and build/deploy dependency. [Checkout](https://github.com/actions/checkout) and [setup-node](https://github.com/actions/setup-node) document the selected current action versions.

The staging step creates `.nojekyll` as an explicit static-site marker. The verified [upload-pages-artifact v4 implementation](https://github.com/actions/upload-pages-artifact/blob/v4/action.yml) filters dotfiles, so that marker is omitted from the upload. This does not enable a Jekyll build: the workflow deploys the prepared artifact directly. Do not add an unsupported `include-hidden-files` input to v4; review its actual action inputs before relying on newer hidden-file behaviour.

## Paths and save data

HTML links and script/style references use relative paths, and JavaScript modules import relative to their own file. The same folder layout therefore works at the local root and under the `/Elsewhere/` repository prefix. Preserve that layout when publishing. Root-absolute paths such as `/src/app.js` would request a file outside the project prefix and break the hosted game.

Saves live in browser local storage. The local preview and published page have different origins, so their saves are independent. `localhost` and `127.0.0.1`, different local ports, and different browsers can also have separate storage. All project paths on the same GitHub Pages hostname share an origin, so the game's namespaced storage key matters if other games are hosted there.

To move a life between local and hosted play, export its save from Settings, open the other address, and import that JSON file. A public deployment does not upload your browser saves to the repository or synchronise them between devices. Clearing browser data can remove local progress; keep exported backups. The game retains the twelve most recent lives in its browser save collection.

## Verification and troubleshooting

After the first publication, inspect the Actions run and its `github-pages` deployment URL. Confirm the page, stylesheet, icon and JavaScript modules load under the repository prefix. Complete a new-life form, advance a year, resolve an event, reload and confirm that the selected life persists. Also verify there are no requests to `/__dev` on the published address.

- **Deployment says Pages is not configured:** enable GitHub Actions as the repository's Pages source, then rerun the workflow.
- **Deployment is waiting:** inspect environment protection and the Actions job log. A required reviewer or a branch restriction can hold publication.
- **Tests fail:** fix the failing simulation or game test and push the correction. The previous successful deployed site remains available.
- **HTML loads without styling or interaction:** inspect relative asset paths and the staged directory layout. The expected hosted script path is `/Elsewhere/src/app.js`.
- **A local life seems missing on the public site:** export/import between the two origins; their storage is independent.
- **Published code appears stale:** confirm the run for the latest `main` commit completed, then reload. Deployment and browser/CDN caching may take a short time to converge.

This file explains the publication setup. Actual deployment status must be confirmed from GitHub; creating the workflow alone does not prove that a public deployment has succeeded.
