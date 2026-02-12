<!-- SLIDE 1 — TITLE -->

<!-- .slide: class="title-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 60%, #51a2da 100%)" -->

<img src="assets/fedora_white-horizontal.png" alt="Fedora" style="height:80px; margin-bottom:0.5em;">

# <!-- .element: style="color:#fff;" --> Building Good Fedora Packages

<!-- .element: style="color:rgba(255, 255, 255, 0.9); font-size:1.1em;" -->

RPM Packaging Workshop for Beginners

<p style="font-size:0.7em; color:rgba(255,255,255,0.9);">Pavel Raiskup · Jiří Kyjovský · Miroslav Suchý</p>
<p style="font-size:0.55em; color:rgba(255,255,255,0.6);">Original materials were created by Tom "spot" Callaway</p>

---

<!-- SLIDE 2 — PREPARE YOUR ENVIRONMENT -->

## Things to do to prepare your environment

- **Packages that you will need installed:**
  - `fedora-packager`, `rpm-build`, `dnf`, `rpmdevtools`, `rpmlint`, `patch`

```bash
sudo dnf install fedora-packager rpm-build dnf rpmdevtools rpmlint patch
```

- **Get a copy of the files we will be working with:**
  - <https://praiskup.fedorapeople.org/courses/packaging/>

- **Use the `rpmdev-setuptree` command** from the `rpmdevtools` package to create `~/rpmbuild` directory tree:

```bash
rpmdev-setuptree
```

Note:

- make sure everyone has the packages installed
- download the enum tarball and patch
- rpmdev-setuptree creates ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

---

<!-- SLIDE 3 — WORKSHOP OVERVIEW -->

## Workshop Overview

**Topic:** intro to RPM, create a simple RPM package from scratch

- **Assumptions**
  - You know how to use a text editor (no matter which one)
  - You know how to manually build "normal" software for Linux
  - You know what is a patch and how to apply it

- **Limitations**
  - This workshop covers a simple piece of software
  - Most packages will be a bit more complicated
  - Some will be a LOT more complicated

- **Information**
  - Feel free to ask questions! Break?

Note:

- simple piece of software: enum
- real-world packages vary in complexity
- feel free to interrupt with questions

---

<!-- SLIDE 4 — OBJECTIVES: RPM PACKAGE MANAGEMENT -->

## Objectives — RPM Package Management

- Why to use RPM packages?
- Can package be problematic?
- What is source and binary package?
- Package file name vs. package name
- Basic commands

Note:

- overview of what we'll cover in this first section
- fundamentals of RPM

---

<!-- SLIDE 5 — WHY PACKAGE AT ALL? -->

## Packaging as a standard (aka, why package at all?)

<div class="two-col">
<div>

- 🔍 **Auditing software usage** — What, where?
- 📌 **Version control**
- 🔄 **Reproducible installations** (Kickstart integration via anaconda, Ansible)
- 🔒 **Minimizes risk**
  - Security
  - Rogue Applications
  - Licensing
  - Trusted provider

</div>
<div>

<div class="box-warn" style="margin-top:1em;">
So you see why <code>sudo make install</code> is just not enough...
</div>

</div>
</div>

Note:

- packaging gives you auditability, reproducibility, security
- sudo make install doesn't track anything
- proper packages integrate with the system properly

---

<!-- SLIDE 6 — PROBLEMS WITH RPMs? -->

## Problems with RPMs? No.

<div class="two-col">
<div>

- RPM is **misunderstood**
- Works **extremely well**
- Package creation is **easier** than you think
- Easy to install...
- Easy to remove...
  - ... with **good** packages!

</div>
<div>

- You can write good software and bad software
- And you can write **good** packages and **bad** packages

<div class="box-green" style="margin-top:1em;">
✅ Our goal today: learn to write <strong>good</strong> packages!
</div>

</div>
</div>

Note:

- RPM itself is solid technology
- the quality depends on the packager
- good packages = clean install, clean remove, proper dependencies

---

<!-- SLIDE 7 — CRASH COURSE IN RPM USAGE -->

## Crash course in RPM Usage

- RPM is archive (actually CPIO, try `/bin/mc` to step inside)
- **Binary (built) Package** `pkg-workshop-1-0.x86_64.rpm`
  - ⚠️ File name is **different** from package name

<div class="two-col" style="font-size:0.85em;">
<div>

**Install** packages with file name:

```bash
rpm -ivh pkg-workshop-1-0.x86_64.rpm
# i for install, v for verbose, h for process hash
```

**Query** installed package with package name:

```bash
rpm -ql pkg-workshop    # q for query, l for list files
```

</div>
<div>

**Remove** package with package name:

```bash
rpm -eh pkg-workshop    # e for erase
```

**List** all installed packages in RPM database:

```bash
rpm -qa
rpm -qi <pkgname>       # info about package
```

</div>
</div>

<div class="box" style="font-size:0.85em;">
There's DNF5/DNF/YUM on top of RPM database, but that's not the topic for today.
</div>

Note:

- rpm is the low-level tool
- DNF sits on top — repo management, dependency resolution
- file name vs package name — common source of confusion

---

<!-- SLIDE 8 — SOURCE RPM OVERVIEW -->

## Source RPM Overview

- **Source Package** (`pkg-workshop-1-0.src.rpm`)
  - SRPMs contain sources/patches/spec file used to generate binary RPM packages

- **Install** SRPM package with SRPM file name:

```bash
rpm -ivh pkg-workshop-1-0.src.rpm
# i for install, v for verbose, h for process hash
```

- Source packages just install source into defined source directory
  - Red Hat default: `~/rpmbuild/SOURCES`
- SRPMs do **not** go into the RPM database

- **Remove** installed SRPM with spec file name:

```bash
rpmbuild --rmsource --rmspec pkg-workshop.spec
```

Note:

- SRPMs = everything needed to reproduce the build
- they install into ~/rpmbuild/SOURCES, not into the system
- not tracked in RPM database

---

<!-- SLIDE 9 — MORE SOURCE RPM OVERVIEW -->

## More Source RPM Overview

- **Making a binary rpm from SRPM:**

```bash
rpmbuild --rebuild pkg-workshop-1-0.src.rpm
```

- **Making a binary rpm from spec file:**

```bash
rpmbuild -ba pkg-workshop.spec
# -b for build, -a for producing all (sub)packages, src.rpm and binary
```

Note:

- --rebuild = one-step: unpack SRPM and build
- -ba = build from spec file, produce all outputs

---

<!-- SLIDE 10 — OBJECTIVES: SPEC FILE -->

## Objectives — Spec file

- What is a SPEC file
- Generators
- Basic syntax:
  - RPM Macros
  - Comments
- Best practices

Note:

- now we'll dive into the spec file itself
- the heart of RPM packaging

---

<!-- SLIDE 11 — COOKING WITH SPEC FILES -->

## Cooking with Spec Files

<div class="two-col">
<div>

- It's a **text file**
- Think of a spec file as a **recipe** 🍳
- Defines the contents of the RPMs
- Describes the process to build, install the sources
- Required to make packages
- Contains shell scripts

</div>
<div>

### Sections/stages:

1. **Preamble** — metadata
2. **Setup** (`%prep`)
3. **Build** (`%build`)
4. **Install** (`%install`)
5. **Clean** (`%clean`)
6. **Files** (`%files`)
7. **Changelog** (`%changelog`)

</div>
</div>

Note:

- spec file = recipe for RPM
- all the sections listed, we'll go through each one
- contains both metadata and shell scripts

---

<!-- SLIDE 12 — COMMON MISTAKES -->

## Common mistakes new packagers make

<div class="two-col">
<div>

### ❌ Spec file generators

- Remember, **functional** is not the same as **good**.

### ❌ Packaging pre-built binaries, not building from source

- (Technically) possible, but you shouldn't start here if you can help it
- **Not permitted** in Fedora

</div>
<div>

### ❌ Disabling automatic checks

- This is a recipe for disaster.
- For example "installed but unpacked" check (you'll see later..)

</div>
</div>

Note:

- generators produce functional but not good specs — always review
- always build from source in Fedora
- don't disable checks — they exist for a reason

---

<!-- SLIDE 13 — RPM MACROS -->

## RPM Macros

- Similar to shell variables
  - They can act as integers or strings, but its easier to always treat them as strings
  - Recursively expanded: `%_bindir` → `%{_exec_prefix}/bin` → `/usr/bin`

- **Macro formats:** `%{foo}` and `%foo`
  - Some macros have environment variable variant, e.g. `$RPM_BUILD_ROOT` vs. `%buildroot` — they hold the same value, but for your sanity (and guidelines), you should consistently use one type of macro in a spec file.

- **Many common macros come predefined**
  - `rpm --showrc` will show you all the defined macros
  - `rpm --eval %macroname` will show you what a specific macro evaluates to
  - Most system path macros begin with an `_` (e.g. `%{_bindir}`)

Note:

- macros are fundamental to spec files
- be consistent — pick either macro or env var style and stick with it
- rpm --eval is your friend for debugging macro values

---

<!-- SLIDE 14 — RPM COMMENTS -->

## RPM Comments

- To add a comment to your RPM spec file, simply start a new line with a `#` symbol. Do this as we go today!
  - ❌ Don't: `Version: 0.0.0.1 # beta, but cool!`

- Good example:

```spec
# I have to delete this file, or else it will not build properly
rm -f foo/bar/broken.c
```

- RPM ignores comment lines entirely
  - Well, to be fair, this isn't true — if you `#` comment out a macro definition, it will evaluate it anyways. Use double-`%`:

```spec
Before: # %configure          ← WRONG, still runs!
After:  # %%configure         ← CORRECT, escaped
```

<div class="box-warn">
⚠️ Note that macros are Turing complete! <code># %(rm -rf stg)</code> — this WILL execute!
</div>

Note:

- comments start with #
- but commented-out macros still expand — use %% to escape
- macros are turing complete — be very careful

---

<!-- SLIDE 15 — CUSTOM RPM MACROS -->

## Custom rpm macros `~/.rpmmacros`

- Syntax: `%macroname value`
- Overrides for system-defined macros `/usr/lib/rpm/`
- Can be overwritten directly in spec file:
  - Syntax: `%global macroname value`

- Example with `%_smp_mflags`

<div class="box-warn">
⚠️ You can make your own macros here, be careful! (why?) <br>
... so, <strong>don't rely on them in spec file</strong> — other builders won't have your <code>~/.rpmmacros</code>!
</div>

Note:

- ~/.rpmmacros is per-user override
- never depend on them in your spec — mock/koji won't have them
- %global is the spec-file way to define macros

---

<!-- SLIDE 16 — FEDORA PACKAGING GUIDELINES -->

## Fedora Packaging Guidelines

- Intended to document a set of **"rules"** and **"best practices"**
- **Living document**, constantly being amended and improved
- **Exceptions** are possible
  - Common exception cases are usually documented
  - If you can justify doing something differently, it is usually permissible, although, it may need to be approved by the Fedora Engineering Steering Committee (FESCo)
  - Use common sense, but when in doubt, defer to the guidelines

<div style="font-size:0.9em;">
<a class="link-card" href="https://docs.fedoraproject.org/en-US/packaging-guidelines/">📖 <strong>https://docs.fedoraproject.org/en-US/packaging-guidelines/</strong></a>
</div>

Note:

- guidelines evolve with the distribution
- exceptions need justification, sometimes FESCo approval
- always refer to the guidelines

---

<!-- SLIDE 17 — OBJECTIVES: PREAMBLE -->

## Objectives — real-life spec — preamble

- What is a preamble?
- What tags can be defined in a preamble?
- Write simple preamble section.

Note:

- now we start building the actual spec file
- preamble first

---

<!-- SLIDE 18 — UNDERSTANDING THE PREAMBLE -->

## Understanding the Spec File: Preamble

<div class="two-col">
<div>

- **Initial section** — mostly metadata (typically no scripts)
  - Defines output of `rpm -qi tar`
- Defines package characteristics

</div>
<div>

- **Name/Version/License**
- Release tracks build changes
- Sources/Patches
- Requirements, for Build & Install
- Summary/Description
- Custom macro definitions

</div>
</div>

Note:

- preamble is the first section of a spec file
- contains all the metadata about the package
- defines what rpm -qi shows

---

<!-- SLIDE 19 — CREATING A NEW SPEC FILE -->

## Workshop: Creating a new spec file

- A spec file is a text file, grab a text editor

- RPM expects spec files to be in `~/rpmbuild/SPECS/`
  - Technically, it doesn't care, but for sanity, lets just keep them there.

- Go ahead and open a new text file called `~/rpmbuild/SPECS/enum.spec`

- Some editors will generate a spec template when you open a new spec file
  - (notably, vim before rhbz#1724126, now it's in `/usr/share/vim/vimfiles/template.spec`)

```bash
rpmdev-setuptree && rpmdev-newspec ~/rpmbuild/SPECS/enum.spec
```

Note:

- create the file manually or use rpmdev-newspec
- rpmdev-newspec generates a template
- we'll fill it in step by step

---

<!-- SLIDE 20 — BLANK PREAMBLE -->

## Workshop: Preamble Items

Here is a blank preamble section, this is where we will start our package!

```spec
Name:
Version:
Release:
Summary:
License:
URL:
Source0:

%description
```

Note:

- this is the skeleton we'll fill in
- each field has a specific purpose
- let's go through them one by one

---

<!-- SLIDE 21 — NAME -->

## Workshop: Name

First, lets fill in the name of our package, which is "enum".

```spec
Name:       enum
Version:
Release:
Summary:
License:
URL:
Source0:

%description
```

- Note: Either use spaces or tabs to separate your fields. Doesn't matter which one as long as you are **consistent**.
- <https://docs.fedoraproject.org/en-US/packaging-guidelines/Naming/>

Note:

- Name must match the upstream project name
- be consistent with whitespace formatting
- check the naming guidelines for edge cases

---

<!-- SLIDE 22 — VERSION -->

## Workshop: Version

```spec
Name:       enum
Version:    1.1
Release:
Summary:
License:
URL:
Source0:

%description
```

- Hopefully, it should be obvious where I got the version from. :)
- Use `/bin/rpmdev-vercmp` if you are in doubt (e.g. beta versions)!
- If your package is a pre or a post release, there are special rules for handling Version and Release, see:
  - <https://docs.fedoraproject.org/en-US/packaging-guidelines/Versioning/>

Note:

- version comes from upstream
- rpmdev-vercmp helps compare version strings
- pre-release and post-release have special versioning rules

---

<!-- SLIDE 23 — RELEASE -->

## Workshop: Release

The Release field is where you track your **package builds**, starting from 1 (guidelines), and incrementing by 1 each time you make a change.

```spec
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:
License:
URL:
Source0:

%description
```

Note:

- Release starts at 1 for each new Version
- incremented for packaging changes (not upstream changes)
- resets to 1 when Version changes

---

<!-- SLIDE 24 — %{?dist} EXPLAINED -->

## Wait, what is that `%{?dist}` thing?

- It is a **macro**!
- It is there to add an identifier (or dist) tag to the end of the release field. **For humans!**
- The `?` means "if defined, use it, if not defined, evaluate to nothing"

- So, if your release field is:

```spec
Release: 1%{?dist}
```

- Then, it evaluates to `1.fc33` on Fedora 33, and `1.el8` on RHEL 8.

<div class="box">
<strong>More info:</strong> <a href="https://docs.fedoraproject.org/en-US/packaging-guidelines/DistTag/">https://docs.fedoraproject.org/en-US/packaging-guidelines/DistTag/</a>
</div>

Note:

- %{?dist} is conditional — only expands if defined
- tells you at a glance which distro/version the package was built for
- always include it in your Release tag

---

<!-- SLIDE 25 — SUMMARY -->

## Workshop: Summary

Summary is a **single sentence** describing what the package does. It does **not** end in a period, and is no longer than **80 characters**.

```spec
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:
URL:
Source0:

%description
```

<div class="box">
We'll fill in a longer description of the package in <code>%description</code>.
</div>

Note:

- summary is short, one line, no period
- max 80 characters
- %description is for the longer text

---

<!-- SLIDE 26 — LICENSE -->

## Workshop: License

The License tag is where we put the **short license identifier** (or identifiers) that reflect the license(s) of files that are built and included in this package.

It is easiest to determine the correct license once we have an unpacked source tree, so we'll put **"TODO"** in this field, and fix it later.

```spec
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:
Source0:

%description
```

Note:

- we'll come back to licensing later
- need to inspect the source tree first
- TODO is a placeholder

---

<!-- SLIDE 27 — URL -->

## Workshop: URL

The URL tag is a link to the **software homepage**.

```spec
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:        https://fedorahosted.org/enum
Source0:

%description
```

Note:

- URL points to upstream project page
- helps users find more info about the software

---

<!-- SLIDE 28 — SOURCE0 -->

## Workshop: Source0

The Source0 tag tells the rpm what source file to use. You can have multiple `Source#` entries, if you need them. Put the **full upstream URL** where you downloaded the file.

```spec
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:        https://fedorahosted.org/enum
Source0:    https://fedorahosted.org/releases/e/n/enum/%{name}-%{version}.tar.bz2

%description
```

<div class="box" style="font-size:0.85em;">
<code>rpmbuild</code> takes the basename. Full URL is mostly for humans.
</div>

Note:

- Source0 is the main source tarball
- can have Source1, Source2, etc. for additional files
- rpmbuild only cares about the filename, not the URL

---

<!-- SLIDE 29 — WHY MACROS IN SOURCE0? -->

## Wait, why did you use macros there?

- You should have noticed that I used `%{name}` and `%{version}` in the Source0 URL.
- `%{name}` evaluates to whatever we have set as Name.
- `%{version}` evaluates to whatever we have set as Version.
- By doing this, it means that we should **not have to change the Source0 line** as new versions release (or if upstream changes the name).
- In fact, **all of the fields in the preamble are defined as macros**, in the exact same way!
- In your spec files, you should try to **use these macros whenever possible**.

Note:

- DRY principle — don't repeat yourself
- when you bump Version, Source0 updates automatically
- all preamble fields become macros you can reference

---

<!-- SLIDE 30 — COPY SOURCES -->

## Copy sources to `~/rpmbuild`

<div class="box">
This is a great time to <strong>copy</strong> (not unpack) the <code>enum-1.1.tar.bz2</code> source into <code>~/rpmbuild/SOURCES/</code>
</div>

```bash
cp enum-1.1.tar.bz2 ~/rpmbuild/SOURCES/
```

Note:

- just copy, don't unpack
- rpmbuild will handle unpacking via %setup
- also copy any patches to ~/rpmbuild/SOURCES/

---

<!-- SLIDE 31 — %description -->

## Workshop: `%description`

- `%description` indicates to RPM that you are entering a block of text which describes the package.
- This can be **multiple lines**, but should be concise and describe the functionality of the package.
- No line in the `%description` can be longer than **80 characters** and it must end with a **period**.
- Try not to simply repeat the summary.

```spec
%description
Utility enum enumerates values (numbers) between two values, possibly
further adjusted by a step and/or a count, all given on the command line.
Before printing, values are passed through a formatter. Very fine control
over input interpretation and output is possible.
```

Note:

- %description is the long description
- shows up in rpm -qi output
- must end with a period, max 80 chars per line
- should complement the Summary, not repeat it

---

<!-- SLIDE 32 — COMPLETE PREAMBLE -->

## Workshop: Complete Preamble

```spec
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:        https://fedorahosted.org/enum
Source0:    https://fedorahosted.org/releases/e/n/enum/%{name}-%{version}.tar.bz2

%description
Utility enum enumerates values (numbers) between two values, possibly
further adjusted by a step and/or a count, all given on the command line.
Before printing, values are passed through a formatter. Very fine control
over input interpretation and output is possible.
```

Note:

- this is our complete preamble so far
- License is still TODO — we'll fix it after inspecting the source
- next: dependencies and patches

---

<!-- SLIDE 33 — EXPLICIT REQUIRES -->

## Preamble: Explicit Requires

`Requires` – This lists any packages which we know are necessary to be present on the system to run the software in our package, once it is installed.

- RPM usually does a **very good job** of autodetecting dependencies and adding them for you, especially when the software is in C, C++, Perl, etc.
- **Think twice** if you need to be explicit.
- Requires can be **versioned**:

```spec
Requires: bar >= 2.0
Requires: bar < 10.0.0
```

Note:

- RPM auto-detects most runtime dependencies
- only add explicit Requires when truly needed
- versioned requires help enforce compatibility

---

<!-- SLIDE 34 — BUILDREQUIRES -->

## Preamble: BuildRequires

- `BuildRequires` – This lists the packages which need to be present **to build** the software.

- Most packages have at least one BuildRequires:

```spec
BuildRequires: make
```

- We will see later if our package needs some BuildRequires.

- You can list as many packages as BuildRequires as you need, although, you should try to avoid redundant items. Also, BuildRequires can be **versioned**:

```spec
BuildRequires: bar >= 2.0
```

Note:

- BuildRequires are evaluated at build time in mock/rpmbuild
- they define the build environment
- avoid redundant ones — don't list transitive dependencies

---

<!-- SLIDE 35 — PATCH -->

## Preamble: `Patch<N>`

`Patch0` – If you need to apply a patch to the software being packaged, you can add a numbered patch entry here:

```spec
Patch0:     enum-1.1-use-putchar.patch
```

- Patch can be a **full URL** as well (like `Source<N>`), if it makes sense.

Note:

- patches are numbered: Patch0, Patch1, etc.
- applied in %prep section
- can be URLs or just filenames (stored in ~/rpmbuild/SOURCES/)

---

<!-- SLIDE 36 — %if CONDITION -->

## `%if` condition

How to handle different OSes with one spec? Use macros and conditions:

```spec
## BUGs!
%if 0%{?rhel} <= 6 || 0%{?fedora} < 17
Requires: ruby(abi) = 1.8
%else
Requires: ruby(release)
%endif
```

Note:

- conditionals let you handle multiple distro versions in one spec
- 0%{?macro} pattern: evaluates to 0 if macro is undefined
- use sparingly — keep specs simple when possible

---

<!-- SLIDE 37 — EXPLICIT PROVIDES -->

## Preamble: Explicit Provides

- `Provides:` tells rpm that this package provides something else.
  - E.g. Httpd `Provides: webserver`, nginx too, and some package `Requires: webserver`.

```spec
Provides: webserver
```

- **Note:** RPM 4.13+ boolean dependencies:

```spec
Requires: (pkgA or pkgB or pkgC)
```

Note:

- Provides declares capabilities
- allows virtual package dependencies
- boolean dependencies are powerful but use wisely

---

<!-- SLIDE 38 — OBJECTIVES: SPEC CONTINUED -->

## Objectives — real spec — continued

In this chapter you will:

- Learn about main sections of SPEC file: **prep**, **build**, **install**, **files** and **changelog**
- Learn about **licenses**
- Learn about **scriptlets**
- How to **build** the binary package from SPEC

Note:

- second major section of the workshop
- we'll build the actual package step by step

---

<!-- SLIDE 39 — UNDERSTANDING %prep -->

## Understanding the `%prep` section (setup)

<div class="two-col">
<div>

- Source tree is generated in `~/rpmbuild/BUILD`
- Sources unpacked here
- Patches applied
- Any pre-build actions

</div>
<div>

### Example of a `%setup` stage:

```spec
%prep
%setup -q
%patch 0 -p1
```

<div class="box-green" style="font-size:0.85em;">
✅ Modern alternative: <code>%autosetup -p1</code>
</div>

</div>
</div>

Note:

- %prep is the first build phase
- sources go to ~/rpmbuild/BUILD/
- %autosetup is the modern way — does %setup + all patches

---

<!-- SLIDE 40 — WORKSHOP: PREP & SETUP -->

## Workshop: Prep & Setup

- First, we need to add a `%prep` line to tell rpm that we're in the %prep phase.
- `%setup` is a very powerful (and complicated) "macro" (builtin) that is included with RPM. It is used to unpack `Source#` files, into `~/rpmbuild/BUILD/`

So, below our `%description` text, we'll add:

```spec
%prep
%setup -q
```

- The `-q` option tells `%setup` to unpack the Source file **quietly**. If you want to see what is happening here, you can omit it, but it usually is a good thing to keep the build logs small and easy to read.
- By default, `%setup` unpacks `Source0` only. It is possible to use `%setup` to unpack multiple `Source#` files at once, for more details on complicated use cases, see Maximum RPM docs.

Note:

- %setup -q = quiet unpack of Source0
- multiple sources require special %setup flags
- for now, we only have one source

---

<!-- SLIDE 41 — PREP: OTHER ITEMS -->

## Prep: Other items

- `%patch 0` – let's specify `Patch0` entry in our spec, and apply it here with the matching `%patch N` macro. Some common options that are good to know:
  - `-p#` — the patch level (how many directories deep does this patch apply)
  - `-b .foo` — a patch suffix, appended to the original files before patching. This is very useful when you need to update or change a patch.

- So, for example, a spec with:

```spec
Patch0: enum-1.1-use-putchar.patch
```

would also need:

```spec
%patch 0 -p0 -b .use-putchar
```

<div class="box-warn" style="font-size:0.9em;">
⚠️ Note that <code>%patch</code> uses <code>--fuzz 0</code>!
</div>

Note:

- -p = patch depth level
- -b = backup suffix for original files
- --fuzz 0 means patches must apply exactly

---

<!-- SLIDE 42 — WORKSHOP: %prep STATUS -->

## Workshop: `%prep`

Here's what our spec looks like now (try `rpmbuild -bp enum.spec`):

```spec
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:        https://fedorahosted.org/enum
Source0:    https://fedorahosted.org/releases/e/n/enum/%{name}-%{version}.tar.bz2
Patch0:     enum-1.1-use-putchar.patch

%description
Utility enum enumerates values (numbers) between two values, possibly
further adjusted by a step and/or a count, all given on the command line.
Before printing, values are passed through a formatter. Very fine control
over input interpretation and output is possible.

%prep
%autosetup -p1
```

Note:

- rpmbuild -bp = run through %prep only, then stop
- verify it works before proceeding
- %autosetup -p1 handles setup + all patches

---

<!-- SLIDE 43 — UNDERSTANDING %build -->

## Understanding the Spec: Build

<div class="two-col">
<div>

- Binary components created ("compiled") within `~/rpmbuild/BUILD`
- Use the included `%configure` macro for good defaults

</div>
<div>

### Example of a `%build` section:

```spec
%build
%configure
%make_build
```

</div>
</div>

- If your package uses "scons", "cmake", alter accordingly (we'll show later how to find out).

Note:

- %build is where compilation happens
- %configure sets proper Fedora defaults (CFLAGS, prefix, libdir, etc.)
- %make_build = make with parallel jobs

---

<!-- SLIDE 44 — WORKSHOP: BUILD -->

## Workshop: Build

Here's what our spec looks like now.

```spec
...
%prep
%autosetup -p1

%build
%configure
%make_build
```

<div class="box-green">
✅ Command <code>rpmbuild -bc enum.spec</code> should work now, fix bugs!
</div>

Note:

- rpmbuild -bc = run through %build, then stop
- if it fails, check the build log for errors
- most common issue: missing BuildRequires

---

<!-- SLIDE 45 — UNDERSTANDING %install -->

## Understanding the Spec: Install

- Creates **buildroot**, `~/rpmbuild/BUILDROOT` — a directory where all build artifacts are installed on the final path. This can include all non-compiled files which should be in final package: documentation, examples, man pages, data files.
- **Lays out filesystem structure:**

```bash
mkdir -p %{buildroot}/var
mkdir -p %{buildroot}/%{_bindir}
```

- **Puts built files in buildroot:**

```bash
cp -a result-of-make/my-application %{buildroot}/%{_bindir}/my-application
```

- **Cleans up** unwanted installed files (if needed):

```spec
%make_install          # installs too much stuff
rm -rf %{buildroot}/%{_datadir}/non-free/
```

Note:

- buildroot is a fake root filesystem
- all files installed there as if it were /
- RPM collects files from buildroot into the package

---

<!-- SLIDE 46 — FIXING OUR INSTALL SECTION -->

## Workshop – Fixing our Install Section

- Our build section is done now. Now, we need to fix up our `%install` section. We know that we need to use "`make install`" to install... try it now.
- ... but RPM doesn't want to install the files into their positions on `/`. We need to install the files into our **BuildRoot**, so that RPM can collect them and package them up in the binary rpm file.
- Here's how you do this. Add this line below `%install`:

```spec
make DESTDIR=%{buildroot} install    # old variant
```

- `%make_install` — modern macro equivalent
- That's all! The `DESTDIR` variable tells make to install into our `%{buildroot}`.
- Some sloppy software Makefiles may not support DESTDIR. If you come across one of these, you should try to add support to the Makefile. Feel free to ask on `#fedora-devel` or `devel@lists.fedoraproject.org` for help with this.

Note:

- DESTDIR is the standard way to redirect installation
- %make_install is the modern macro
- if Makefile doesn't support DESTDIR, you may need to patch it

---

<!-- SLIDE 47 — WORKSHOP: INSTALL -->

## Workshop: Install

```spec
BuildRequires: asciidoc
...

%build
%configure --disable-doc-rebuild
%make_build

%install
%make_install
```

<div class="box" style="font-size:0.85em;">
<strong>Old variants (don't use anymore):</strong><br>
<code>make %{?_smp_mflags}</code> → use <code>%make_build</code><br>
<code>rm -rf $RPM_BUILD_ROOT</code> → not needed nowadays<br>
<code>make install DESTDIR=%{buildroot}</code> → use <code>%make_install</code>
</div>

Note:

- we discovered we need asciidoc as BuildRequires
- --disable-doc-rebuild may be needed for some packages
- use modern macros: %make_build, %make_install

---

<!-- SLIDE 48 — UNDERSTANDING %files -->

## Understanding the Spec: `%files`

<div class="two-col">
<div>

- `%files`: List of package contents
  - If it is **not** in `%files`, it is **not** in the package.
  - RPM **WILL** complain about unpackaged files.

</div>
<div>

- We'll come back to this section at the end, when we know what to put in it. For now, lets just define the section, by adding the `%files` line below our `%install` section:

```spec
%files
```

</div>
</div>

Note:

- %files is crucial — it defines what ends up in the RPM
- empty %files = empty package (but rpmbuild will complain about leftover files)
- we'll fill it in after we know what got installed

---

<!-- SLIDE 49 — UNDERSTANDING CHANGELOG -->

## Understanding the Spec: Changelog

- Used to track **package** changes
- **Not** intended to replace source code Changelog
- Provides explanation for package users, audit trail
- Update on **EVERY** change

### Example of Changelog section:

```spec
%changelog
* Mon Jun 2 2008 Tom "spot" Callaway <tcallawa@redhat.com> 1.1-3
- minor example changes

* Mon Apr 16 2007 Tom "spot" Callaway <tcallawa@redhat.com> 1.1-2
- update example package

* Sun May 14 2006 Tom "spot" Callaway <tcallawa@redhat.com> 1.1-1
- initial package
```

Note:

- changelog tracks packaging changes, not upstream changes
- strict format: * Day Mon DD YYYY Name <email> - Version-Release
- each change on a new line starting with -

---

<!-- SLIDE 50 — WORKSHOP: CHANGELOG -->

## Workshop: Changelog

- Below our `%files` section, as the **last item** in the spec, add a line for changelog:

```spec
%changelog
```

- Then, lets add our first changelog entry, in the proper layout:

```spec
* Fri Sep 21 2012 Your Name Here <youremail@here> - 1.1-1
- New package for Fedora
```

<div class="box-green" style="font-size:0.9em;">
✅ You may use <code>rpmdev-bumpspec enum.spec</code> to do the most hard work for you.
</div>

Note:

- changelog is always the LAST section
- rpmdev-bumpspec automates bumping release and adding entries
- always add a changelog entry when you change the spec

---

<!-- SLIDE 51 — SPEC FILE STATUS -->

## Workshop – Spec File Status

```spec
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:        https://fedorahosted.org/enum
Source0:    https://fedorahosted.org/releases/e/n/enum/%{name}-%{version}.tar.bz2

%description
Utility enum enumerates values (numbers) between two values, possibly
....

%prep
%setup -q

%build
%configure
%make_build

%install
%make_install

%files

%changelog
* Fri Sep 21 2012 Your Name Here <youremail@here> - 1.1-1
- New package for Fedora
```

Note:

- this is our complete spec so far
- License is still TODO
- %files is still empty — we'll fix both

---

<!-- SLIDE 52 — BUILDING OUR SOURCE TREE -->

## Workshop – Building our source tree

- Now, we can use that source tree to help us fill in the blanks we left earlier — `License: TODO`
- At this point, we can use our spec to build our source tree and take a look around it.
- Save your spec file, and run (as a normal user):

```bash
rpmbuild -bp ~/rpmbuild/SPECS/enum.spec
```

- The `-bp` option tells rpmbuild to run through the `%prep` stage, then **stop**.
- It should complete without errors, and you should see a new directory in `~/rpmbuild/BUILD/enum-1.1/`

Note:

- -bp = build prep only
- now we can inspect the source tree
- look for license files, README, build system

---

<!-- SLIDE 53 — LICENSING -->

## Workshop — Licensing

As a responsible Fedora packager, it is important that you do the licensing **correct** for your package.

**Here are some general steps to follow:**

1. Is there a `COPYING` or `LICENSE` file? If so, read it, and remember its file name, because we'll want to include it in our package.
2. Is there a `README` file? Read it, and look for any mention of "Copyright" or "License".
3. Look at the **actual source files** in your text editor. Some code projects will describe their license in the header comments of each source file.
4. Note all licenses that you see, then look them up in the Fedora Licensing chart.

<div class="box">
<a href="https://docs.fedoraproject.org/en-US/legal/allowed-licenses/"><strong>Fedora allowed licenses</strong></a>
</div>

**What license do you find for enum?**

Note:

- licensing is a critical responsibility
- check COPYING, LICENSE, README, source headers
- all licenses must be on the Fedora allowed list

---

<!-- SLIDE 54 — LICENSING PART TWO -->

## Workshop – Licensing Part Two

- `enum` is licensed under the **BSD 3-Clause Licence**. In Fedora, the short name identifier for this license is `BSD-3-Clause`.
- Licensing can be very complicated! When in doubt, feel free to email `fedora-legal@lists.fedoraproject.org` or `legal@fedoraproject.org` to get help.
- Now, we need to fix our spec. Open it up in a text editor again, and change the License tag from `TODO` to `BSD-3-Clause`
- Also, did you see that file `COPYING`? We need to make sure they are installed in our package, so we'll add them to our `%files` list, using a macro called `%license` (formerly `%doc` was used).

<div class="two-col" style="font-size:0.85em;">
<div>

- Audit tools: `licensecheck` helper, `askalono-cli` package
- License changes **must** be announced on developer list

</div>
<div>

- **Multiple Licensing Scenarios:** `LGPL-2.0-or-later AND MIT`
- The example with Solaris && glibc small code chunk copy-pasted

</div>
</div>

Note:

- BSD-3-Clause is the SPDX identifier
- %license is the modern way to mark license files
- multiple licenses use AND/OR operators
- always ask legal@ when unsure

---

<!-- SLIDE 55 — UNDERSTANDING %doc -->

## Workshop – Understanding `%doc`

- `%doc` is a special macro that is used to:
  - Mark files as **documentation** inside an RPM (`rpm -qd tar`)
  - Copy them directly from the source tree in `~/rpmbuild/BUILD/enum-1.1/` into the "docdir" for your package, ensuring that your package always has them.

- `%license` is similar — license-related "documentation" (`rpm -qL tar`)

- So, lets add a line to `%files` for our license texts, so that it now looks like this:

```spec
%files
%license COPYING
%doc ChangeLog
```

- Once you're done, save your spec file again.

Note:

- %doc marks documentation files
- %license marks license files (modern replacement for using %doc for licenses)
- rpm -qd shows docs, rpm -qL shows license files

---

<!-- SLIDE 56 — HOW DOES ENUM BUILD AND INSTALL? -->

## Workshop – How Does Enum Build and Install?

- Now, we need to look in the `~/rpmbuild/BUILD/enum-1.1/` source tree to figure out how to build and install the code.

- Here's a big hint: Many Linux software projects use these commands to build:

```bash
./configure
make
```

And these commands to install:

```bash
make install
```

- Some packages will not be so clean. Look for `INSTALL` or `README` to describe it, or the project website. When in doubt, ask!

Note:

- look for configure, Makefile, CMakeLists.txt, meson.build, setup.py
- INSTALL and README usually document the build process
- enum uses the classic ./configure && make flow

---

<!-- SLIDE 57 — HISTORY LESSONS -->

## History Lessons

- Before Fedora 12 (and in RHEL 5 or older), it used to be necessary to manually remove the `%{buildroot}` as the very first step in the `%install` stage, like this:

```spec
%install
rm -rf %{buildroot}
```

With Fedora 12 (or newer) RPM, the `%install` stage **automatically deletes** the `%{buildroot}` for you as the very first step, so this is **no longer necessary**.

- Also, it used to be necessary to define a `%clean` section to clean up the `%{buildroot}` at the end of the package build process, it looked like this:

```spec
%clean
rm -rf %{buildroot}
```

With Fedora 12+ RPM, this `%clean` section is handled internally and does **not** need to be explicitly defined.

Note:

- historical context — you'll see these in old specs
- modern rpmbuild handles both automatically
- remove them if you see them in specs you're updating

---

<!-- SLIDE 58 — HISTORY LESSONS #2 -->

## History Lessons #2

- In the recent past, there was a mandatory field in the Preamble statement called `BuildRoot` — it is now defined automatically (EL6+). You can drop such lines:

```spec
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
```

<div class="box" style="font-size:0.9em;">
Don't add <code>BuildRoot</code>, <code>%clean</code>, or <code>rm -rf %{buildroot}</code> to new specs — they're obsolete.
</div>

Note:

- BuildRoot was mandatory before EL6
- modern RPM defines it automatically
- remove from old specs when updating

---

<!-- SLIDE 59 — STATUS -->

## Workshop — Status

- Okay, history lesson over. Your spec should have a fleshed out `%build` and `%install`, which look like this:
  - **see console**
- Save your spec file out. There is one thing we're missing from our spec, the list of files to go into `%files`! I'm about to share a clever trick on how to make it easier.

Note:

- verify your spec matches what we've built so far
- the clever trick is coming up next — let rpmbuild tell you what files to include

---

<!-- SLIDE 60 — BUILD OUR PACKAGE -->

## Workshop – Build our package

Now, as a normal user run:

```bash
rpmbuild -ba ~/rpmbuild/SPECS/enum.spec
```

- The `-ba` options tell rpmbuild to build **"all"**, source and binary packages.
- This is going to run through `%build`, then `%install` ... and then **fail**, because we don't have a complete `%files` list specified.

Note:

- -ba = build all (source + binary packages)
- it WILL fail — that's expected!
- the failure output is actually very helpful

---

<!-- SLIDE 61 — BUILD OUTPUT -->

## Workshop – Build our package (output)

But, when it fails, it does us a **favor**, check out the output!

```
RPM build errors:
    Installed (but unpackaged) file(s) found:
    /usr/bin/enum
    /usr/lib/debug/usr/bin/enum-1.1-1.fc33.x86_64.debug
    /usr/share/man/man1/enum.1.gz
```

<div class="box-green">
✅ RPM has just told us what files are missing from the <code>%files</code> list!
</div>

Note:

- "installed but unpackaged" is your friend
- RPM tells you exactly which files need to be in %files
- this is why you should never disable this check!

---

<!-- SLIDE 62 — ADDING MISSING %files -->

## Workshop – Adding missing `%files`

```spec
%files
%license COPYING
%doc ChangeLog
%{_mandir}/man1/enum.1*
%{_bindir}/enum
```

We skipped the debug file, because once we added the corresponding executable then rpmbuild picks the debug file **automatically**.

Note:

- use macros for paths: %{_bindir}, %{_mandir}
- debuginfo is handled automatically
- wildcards (enum.1*) handle compression (.gz)

---

<!-- SLIDE 63 — FILES: %defattr -->

## Workshop: Files

- You may also add a `%defattr` line. The `%defattr` macro tells RPM what to set the default attributes to for any and all files in the `%files` section. The Fedora default is `(-,root,root,-)`. You do **not** need to define it again.

```spec
%attr(<file mode>, <user>, <group>, <dir mode>)
```

<div class="box">
<a href="http://ftp.rpm.org/max-rpm/s1-rpm-specref-files-list-directives.html">http://ftp.rpm.org/max-rpm/s1-rpm-specref-files-list-directives.html</a>
</div>

Note:

- %defattr sets default file ownership/permissions
- Fedora default is (-,root,root,-) — no need to specify
- use %attr for individual files that need special permissions

---

<!-- SLIDE 64 — ALMOST DONE -->

## Workshop – Almost done

- At this point, make sure you have all useful documentation listed in `%files` as `%doc`, not just the license text. Look for `README` and `ChangeLog`.
- `INSTALL` is usually **not** very helpful, do not install it.
- That should be it! Look over your spec and make sure you're happy with it, then save it, and run:

```bash
rpmbuild -ba ~/rpmbuild/SPECS/enum.spec
```

Note:

- double-check documentation files
- INSTALL is just build instructions — not useful for end users
- save and build!

---

<!-- SLIDE 65 — STATUS CHECK -->

## Workshop – Status Check

- At this point, you should now have a `enum-1.1-1.src.rpm` and one arch rpm: `enum-1.1-1.fc*.*.rpm` (the Fedora versions and architectures will vary, depending on your system).
- If so, **congratulations!** You're on your way to really understanding how to make good Fedora packages!
- If it failed, no worries. Take a look at the last few lines that RPM output, and it will probably give you an idea of what to fix. Feel free to ask for help.
- The next step is to check the package for minor issues, and you use a tool called `rpmlint` for this. Run:

```bash
rpmlint ~/rpmbuild/SRPMS/enum-1.1-1.src.rpm ~/rpmbuild/RPMS/*/enum*.rpm
```

- If you find any errors, try to correct them in the spec and rebuild. If you do make changes to your spec file, **increment your Release** and add a new changelog entry at the top of your `%changelog` section!

Note:

- congratulations on building your first package!
- rpmlint is the quality checker
- fix errors, bump Release, add changelog, rebuild
- iterate until rpmlint is clean

---

<!-- SLIDE 66 — BONUS: RPM SCRIPTLETS -->

## Bonus — RPM Scriptlets

- Shell code sections executed at certain times during package installation: `%pre`, `%post`, `%preun`, `%postun`
- Scriptlets are **non-interactive**, no arguments, macros are expanded at package **build time** and baked-into the RPM file
- Remember, RPM DB **doesn't track** what is done here
- The best intentions can easily go evil (it is hard to get scriptlets right), but sometimes are necessary (but distribution development is trying to convert them to a **declarative format**, like with system-users creation)
- More info: RPM packaging guide and Fedora guidelines.

Note:

- scriptlets run during install/remove of the package
- they're powerful but dangerous
- prefer declarative alternatives (sysusers.d, tmpfiles.d, etc.)
- if you must use them, test thoroughly

---

<!-- SLIDE 67 — BEST PRACTICES -->

## Best Practices

- **K.I.S.S.** — Keep It Simple
- Use **patches**, not rpm hacks
- **Avoid scriptlets**, minimize wherever possible
  - Leverage **triggers** instead (fedora docs)
- Use `%changelog`
- Look at and **learn from other Fedora packages**
  - Huge tarball with all spec files
- Use **macros** sanely
  - Be consistent
  - Utilize system macros

Note:

- KISS is the number one rule
- existing packages on src.fedoraproject.org are a goldmine
- consistency is key — pick a style and stick with it

---

<!-- SLIDE 68 — DO NOT BUILD AS ROOT -->

## Do not build a package as root

<div class="box-warn" style="font-size:1.1em;">
⚠️ Do <strong>NOT EVER</strong> build RPMS as root.<br>
Let me repeat, do <strong>NOT EVER</strong> build RPMS as root.
</div>

- Ideally run under a separate build-specific user (use **mock** ideally)

### Why? Look at this:

```spec
%install
%make_install
# remove patent protected files
rm -rf $RPM_TYPO_BUILDROO/var/
```

<div class="box-warn">
⚠️ <strong>THIS WILL REMOVE <code>/var</code> on your system!</strong> Why? Because the typo in the variable name makes it evaluate to empty string, so it becomes <code>rm -rf /var/</code>
</div>

Note:

- never build as root — typos can destroy your system
- use mock for isolated, reproducible builds
- the example is real — a typo in buildroot variable = disaster

---

<!-- SLIDE 69 — BETTER THAN BEST PRACTICES -->

## Better than Best Practices

- Use `rpmlint`, fix warnings/errors
- Include configs/scripts as `Source` files
- **Comment!**
  - ...but keep it legible
  - Think of the guy who will have to fix your package when you leave.
- **Don't ever** call `/bin/rpm*` from inside a spec file.
  - RPM is **NOT** re-entrant

Note:

- rpmlint is your quality gate
- document your spec with comments
- never call rpm commands from within a spec — it's not re-entrant
- think about maintainability

---

<!-- SLIDE 70 — GOOD PACKAGES PUT YOU IN CONTROL -->

## Good Packages Put You In Control

<div class="three-cards">
  <div>
    <div class="card-icon">🎯</div>
    <h3>Practice</h3>
    <p style="font-size:0.75em;">Practice makes perfect</p>
  </div>
  <div>
    <div class="card-icon">🔧</div>
    <h3>Integration</h3>
    <p style="font-size:0.75em;">Integration with the Fedora tools makes it easier for users to get and use that software!</p>
  </div>
  <div>
    <div class="card-icon">📦</div>
    <h3>Simplify</h3>
    <p style="font-size:0.75em;">Simplify, standardize, save time and sanity.<br><strong>Build once, install many.</strong></p>
  </div>
</div>

Note:

- packaging is a skill — the more you do it, the better you get
- Fedora ecosystem integration is a major benefit
- build once, install many — that's the power of good packages

---

<!-- SLIDE 71 — USEFUL LINKS -->

## Useful Links

<div style="font-size:0.8em;">
<a class="link-card" href="https://docs.fedoraproject.org/en-US/packaging-guidelines/">📖 <strong>Fedora Packaging Guidelines</strong></a>
<a class="link-card" href="https://fedoraproject.org/wiki/Packaging:ReviewGuidelines">📋 <strong>Review Guidelines</strong></a>
<a class="link-card" href="http://www.rpm.org/max-rpm-snapshot/">📚 <strong>Maximum RPM</strong></a>
<a class="link-card" href="https://rpm-packaging-guide.github.io/">📘 <strong>RPM Packaging Guide</strong></a>
<a class="link-card" href="https://src.fedoraproject.org/">💻 <strong>Fedora GIT Tree</strong> — contains lots of example specs</a>
<a class="link-card" href="https://admin.fedoraproject.org/mailman/listinfo/packaging">✉️ <strong>Fedora packaging mailing list</strong></a>
<a class="link-card" href="http://rpmlint.zarb.org/cgi-bin/trac.cgi">🔍 <strong>Rpmlint website</strong></a>
<a class="link-card" href="http://rpm.org/documentation.html">📄 <strong>RPM.org documentation</strong></a>
</div>

Note:

- these are your go-to references
- Fedora GIT tree is a gold mine of real-world spec files
- the mailing list is great for getting help

---

<!-- SLIDE 72 — Q&A -->

<!-- .slide: class="section-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 100%)" -->

## <!-- .element: style="color:#fff;" --> Q&A

<!-- .element: style="font-size:3em;" --> ❓

Note:

- open the floor for questions

---

<!-- SLIDE 73 — CLOSING -->

<!-- .slide: class="closing-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 60%, #51a2da 100%)" -->

<img src="assets/fedora_white-horizontal.png" alt="Fedora" style="height:70px; margin-bottom:0.5em;">

# <!-- .element: style="color:#fff;" --> Happy packaging! 📦

<!-- .element: style="color:rgba(255,255,255,0.85);" -->

<p style="font-size:0.55em; color:rgba(255,255,255,0.5); margin-top:1.5em;">
  <a href="https://docs.fedoraproject.org/en-US/packaging-guidelines/" style="color:rgba(255,255,255,0.6);">Packaging Guidelines</a> •
  <a href="https://src.fedoraproject.org/" style="color:rgba(255,255,255,0.6);">dist-git</a> •
  <a href="https://rpm-packaging-guide.github.io/" style="color:rgba(255,255,255,0.6);">RPM Packaging Guide</a>
</p>

<p style="font-size:0.5em; color:rgba(255,255,255,0.45); margin-top:0.8em;">
  #fedora-devel (Matrix) · devel@lists.fedoraproject.org
</p>

Note:

- Thanks for attending!
- reach out on Matrix or mailing list for help
