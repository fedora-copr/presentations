<!-- SLIDE 1 INTRODUCTION -->

<!-- .slide: class="title-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 60%, #51a2da 100%)" -->

<img src="assets/fedora_white-horizontal.png" alt="Fedora" style="height:80px; margin-bottom:0.5em;">

# <!-- .element: style="color:#fff;" --> Copr

<!-- .element: style="color:rgba(255, 255, 255, 0.9); font-size:1.1em;" -->

Build your own RPM repositories

<p style="font-size:0.7em; color:rgba(255,255,255,0.9);">Jiří Kyjovský</p>
<p style="font-size:0.55em; color:rgba(255,255,255,0.6);">FAS: nikromen • jkyjovsk@redhat.com</p>
<p style="font-size:0.55em; color:rgba(255,255,255,0.5);">
  <a href="https://copr.fedorainfracloud.org" style="color:rgba(255,255,255,0.7);">copr.fedorainfracloud.org</a>
</p>

Note:

- introduce
- about what is workshop
- workshop ~40 min
- feel free to ask questions any time

---

<!-- SLIDE 2 -->

## Agenda

<div style="font-size:0.95em;">

- What is Copr and why use it
- Demo: Web UI — project, build, results
- Demo: copr-cli — same thing from the terminal
- Installing a package from Copr
- Integration, automation & links
- Q&A

</div>

Note:

- go through the agenda items
- feel free to ask questions at any point

---

<!-- SLIDE 3 -->

## What is Copr?

<div class="three-cards">
  <div>
    <div class="card-icon">📦</div>
    <h3>Source</h3>
    <p style="font-size:0.75em;">You provide SRPM, spec file, or Git URL</p>
  </div>
  <div>
    <div class="card-icon">⚙️</div>
    <h3>Build</h3>
    <p style="font-size:0.75em;">Copr builds in desired mock chroot</p>
  </div>
  <div>
    <div class="card-icon">🚀</div>
    <h3>Install</h3>
    <p style="font-size:0.75em;"><code>dnf copr enable</code> + <code>dnf install</code></p>
  </div>
</div>

<div>

- Like PPA or AUR - but for Fedora, EPEL, CentOS Stream, ...
- All you need: [FAS account](https://accounts.fedoraproject.org) - free, no approval
- No need to be a Fedora packager

</div>

<div class="box-warn">⚠️ Resulting repo is public!</div>

Note:

- Copr = Community Projects
- the 3 key steps: Source -> Build -> Install - this is the whole flow
- you provide the source -> Copr builds in mock -> ready-made DNF repo
- PPA and AUR analogy
- FAS, free, no approval needed
- builds in the cloud, you don't worry about infra
- distros: Fedora, EPEL 8/9, CentOS Stream, many more
- archs: x86_64, aarch64, ppc64le, s390x, (riscv64)
- resulting repo is public!

---

<!-- SLIDE 4 -->

## Copr vs. Koji

<div class="two-col">

<div>
<table class="vs-table">
  <tr>
    <th></th>
    <th><img src="assets/copr-logo.png" style="height:48px; vertical-align:middle;"></th>
    <th><img src="assets/koji-logo.png" style="height:48px; vertical-align:middle;"></th>
  </tr>
  <tr><td><strong>For</strong></td><td>Personal / community</td><td>Official Fedora</td></tr>
  <tr><td><strong>Access</strong></td><td>Anyone (FAS)</td><td>Sponsored</td></tr>
  <tr><td><strong>Repo</strong></td><td>Own per-project</td><td>Fedora repos</td></tr>
  <tr><td><strong>Guidelines</strong></td><td>Not required</td><td>Required</td></tr>
</table>
</div>

<div>

### Supported sources

- 📤 Upload SRPM / URL
- <img src="assets/git.png" style="height:28px; vertical-align:middle;"> &nbsp;SCM (Git) — rpkg, tito, make srpm
- 📦 DistGit — Fedora / CentOS
- <img src="assets/python-logo.svg" style="height:28px; vertical-align:middle;"> &nbsp;PyPI / 💎 RubyGems
- </> Custom script

</div>

</div>

Note:

- Koji = official Fedora builds
- Copr = personal, experimental, upstream, CI/CD
- packaging guidelines not required (but good practice)
- source types just as overview
- today: SRPM upload and URL
- SCM = Copr clones Git
- PyPI = package name -> RPM built automatically

---

<!-- SLIDE 5 -->

## Demo: Copr Web UI

- FAS account needed

<div class="box" style="margin-top:0.5em;">
  <strong>Test SRPM:</strong>
  <code style="font-size:0.85em;">https://github.com/fedora-copr/copr-test-sources/raw/main/hello-2.8-1.src.rpm</code>
</div>

<div class="box-warn">⚠️ Project name cannot be changed later!</div>

Note:

- LOG IN
  - homepage - show search, popular projects
  - Log in - FAS
  - dashboard - "My projects"
- NEW PROJECT
  - New Project
  - name: workshop-demo
  - description, chroots (fedora-rawhide-x86_64)
  - mention the Repos field (extra dependencies)
  - temporary project option
  - fedora review integration
  - create
- BUILD
  - Builds tab -> New Build
  - show the source types
  - URL -> paste the test SRPM from the slide
  - Build
- MONITOR BUILD
  - statuses: pending -> running -> succeeded or failed
  - click on detail
  - show builder-live.log
  - show results: RPM, SRPM, logs
- WALK THROUGH TABS
  - Overview -> .repo download button
  - Packages -> default source
  - Monitor -> overview
  - Settings -> Permissions
  - Settings -> Integrations

---

<!-- SLIDE 6 -->

## ⌨️ Demo: copr-cli — setup

<div class="two-col">
<div>

### 1. Install

```bash
sudo dnf install copr-cli
```

### 2. Get API token

👉 [copr.fedorainfracloud.org/api](https://copr.fedorainfracloud.org/api/)

</div>
<div>

### 3. Save config

```ini
# ~/.config/copr
[copr-cli]
login = <generated-login>
username = <your-username>
token = <generated-token>
copr_url = https://copr.fedorainfracloud.org
```

</div>
</div>

<div class="box-warn">⚠️ Without this config file, copr-cli won't work (except read-only commands).</div>

Note:

- INSTALLATION
  - dnf install copr-cli
- API TOKEN (NOT ON MY ACC!!)
  - browser: copr.fedorainfracloud.org/api/
  - show the generated config
  - copy to ~/.config/copr
- VERIFY
  - copr whoami
  - copr list: see workshop-demo from the UI demo

---

<!-- SLIDE 7 -->

## Demo: copr-cli — commands

```bash
# Create a project
copr create workshop-cli-demo \
    --chroot fedora-rawhide-x86_64 \
    --chroot fedora-41-x86_64

# Submit a build (from URL)
copr build workshop-cli-demo \
    https://github.com/fedora-copr/copr-test-sources/raw/main/hello-2.8-1.src.rpm

# Submit a build from a local SRPM
copr build workshop-cli-demo ./hello-2.8-1.src.rpm

# Build status / list builds
copr status <BUILD_ID>
copr list-builds workshop-cli-demo

# Download results
copr download-build <BUILD_ID> --dest ./results/
```

<div class="box-green">✅ Without <code>--nowait</code>, the CLI tracks the build progress in real time.</div>

Note:

- CREATE
  - copr-cli create workshop-cli-demo ...
  - mention: --description, --repo, --delete-after-days
  - basically show --help
- BUILD
  - copr-cli build from URL
  - show real-time output
  - mention --nowait
  - --help
- STATUS
  - copr-cli status BUILD_ID
  - copr-cli list-builds
- DOWNLOAD
  - copr-cli download-build BUILD_ID --dest ./results/
  - show the downloaded files
- MENTION OTHERS
  - fork, buildscm, modify, delete
  - man copr-cli

---

<!-- SLIDE 8 -->

## Installing a package from Copr

<div class="three-cards" style="margin-bottom:0.5em;">
  <div>
    <div class="card-icon">🔓</div>
    <h3>Enable</h3>
    <code style="font-size:0.7em;">sudo dnf copr enable &lt;user&gt;/&lt;project&gt;</code>
  </div>
  <div>
    <div class="card-icon">📥</div>
    <h3>Install</h3>
    <code style="font-size:0.7em;">sudo dnf install hello</code>
  </div>
</div>

```bash
dnf copr list                                  # list active Copr repos
sudo dnf copr disable <USER>/workshop-demo     # disable (keeps packages!)
sudo dnf remove hello                          # uninstall
```

<div class="box" style="font-size:0.85em;">
  <strong>Alternative:</strong> Download .repo file from the UI → Overview tab → button next to chroot.
</div>

Note:

- ENABLE REPO
  - dnf copr enable USER/workshop-cli-demo
  - cat /etc/yum.repos.d/_copr:*workshop*
  - mention: GPG signed (gpgcheck=1)
- INSTALL
  - dnf install hello
  - hello -> verify it works
  - rpm -qi hello | grep "Vendor" -> we can see Copr there
- MANAGEMENT
  - dnf copr list
  - dnf copr disable -> does NOT remove packages!
  - dnf remove hello
- MENTION
  - .repo can also be downloaded from the UI

---

<!-- SLIDE 9 -->

## Integration & automation

<div class="logo-row" style="margin-bottom:0.6em;">
  <img src="assets/github-mark.svg" alt="GitHub" title="GitHub">
  <img src="assets/gitlab-mark.svg" alt="GitLab" title="GitLab">
</div>

<div class="three-cards" style="font-size:0.8em;">
  <div>
    <h3>🔗 Webhooks</h3>
    <p>GitHub / GitLab / Bitbucket<br>Auto-rebuild on push or tag<br>Settings → Integrations</p>
  </div>
  <div>
    <h3><img style="height:28px; margin-bottom:0em; margin-top:0em" src="assets/packit-logo.png" alt="Packit" title="Packit"> Packit</h3>
    <p>Copr builds from GitHub PRs<br>Results posted in the PR<br><a href="https://packit.dev">packit.dev</a></p>
  </div>
  <div>
    <h3>📡 API</h3>
    <p>Full REST API Python lib <a href="https://python-copr.readthedocs.io/en/latest/">python-copr</a> <a href="https://copr.fedorainfracloud.org/api_3/docs/">Swagger docs</a></p>
  </div>
</div>

<div class="box" style="font-size:0.78em; margin-top:0.3em;">
  <strong>SCM builds:</strong> <code>.copr/Makefile</code> - monorepo with multiple packages, custom SRPM build script
</div>

Note:

- **overview only, no demo**
- WEBHOOKS
  - Settings -> Integrations -> you can check docs
- PACKIT
  - builds from GitHub PRs
  - posts results as PR comments
  - packit.dev
- .copr/Makefile
  - make srpm target
  - could be monorepo, multiple spec files
  - show my hyprland-rpm monorepo
- API
  - Swagger docs
  - python-copr library

---

<!-- SLIDE 10 -->

## Summary

<!-- Rule of 3 recap -->
<div class="three-cards" style="margin-bottom:0.6em;">
  <div>
    <div class="card-icon">📦</div>
    <h3>Source</h3>
    <p style="font-size:0.7em;">SRPM, URL, Git, PyPI…</p>
  </div>
  <div>
    <div class="card-icon">⚙️</div>
    <h3>Build</h3>
    <p style="font-size:0.7em;">Multi-distro, multi-arch</p>
  </div>
  <div>
    <div class="card-icon">🚀</div>
    <h3>Install</h3>
    <p style="font-size:0.7em;">Web UI + CLI + REST API + webhooks</p>
  </div>
</div>

<div style="font-size:0.8em;">
<a class="link-card" href="https://copr.fedorainfracloud.org">🌐 <strong>copr.fedorainfracloud.org</strong></a>
<a class="link-card" href="https://docs.pagure.org/copr.copr/">📖 <strong>Documentation</strong> · <strong>API</strong></a>
<a class="link-card" href="https://github.com/fedora-copr/copr">💻 <strong>GitHub</strong> · <code>man copr-cli</code></a>
</div>

Note:

- **recap the 3 steps: Source -> Build -> Install**
- mention what we didn't show: build batches, forking, and many features (you can always check docs)
- go through the links
- show that we maintain rhcopr as well

---

<!-- SLIDE 11 -->

<!-- .slide: class="section-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 100%)" -->

## <!-- .element: style="color:#fff;" --> Q&A

<!-- .element: style="font-size:3em;" --> ❓

Note:

- open the floor for questions
- silence -> go to FAQ slide

---

<!-- SLIDE 11b -->

## Frequently Asked Questions

- **How long are builds kept?** - latest successful forever, old/failed after 14 days
- **Build timeout?** - default 5h
- **Is it safe?** - FAS accounts, GPG signing, public SRPM, you can verify
- **Koji vs Copr?** - Koji = official Fedora, Copr = community / personal
- **Packaging guidelines?** - recommended, but not required

---

<!-- SLIDE 12 -->

<!-- .slide: class="closing-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 60%, #51a2da 100%)" -->

<img src="assets/fedora_white-horizontal.png" alt="Fedora" style="height:70px; margin-bottom:0.5em;">

# <!-- .element: style="color:#fff;" --> Happy building! 🏗️

<!-- .element: style="color:rgba(255,255,255,0.85);" -->

<p style="font-size:0.55em; color:rgba(255,255,255,0.5); margin-top:1.5em;">
  <a href="https://copr.fedorainfracloud.org" style="color:rgba(255,255,255,0.6);">copr.fedorainfracloud.org</a> •
  <a href="https://docs.pagure.org/copr.copr/" style="color:rgba(255,255,255,0.6);">docs</a> •
  <a href="https://github.com/fedora-copr/copr" style="color:rgba(255,255,255,0.6);">github</a>
</p>

<p style="font-size:0.5em; color:rgba(255,255,255,0.45); margin-top:0.8em;">
  #fedora-buildsys (Matrix) · #copr (Slack) · <a href="https://github.com/fedora-copr/copr/issues" style="color:rgba(255,255,255,0.55);">GitHub Issues</a>
</p>

Note:

- Thanks
- \#fedora-buildsys (Matrix)
- #copr (slack)
- github.com/fedora-copr/copr (issues)
