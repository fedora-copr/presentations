<!-- SLIDE 1 -->

<!-- .slide: class="title-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 60%, #51a2da 100%)" -->

<img src="assets/fedora_white-horizontal.png" alt="Fedora" style="height:80px; margin-bottom:0.5em;">

# <!-- .element: style="color:#fff;" --> Building Good Fedora Packages

<!-- .element: style="color:rgba(255, 255, 255, 0.9); font-size:1.1em;" -->

RPM Packaging Workshop for Beginners

<p style="font-size:0.7em; color:rgba(255,255,255,0.9);">Pavel Raiskup · Jiří Kyjovský · Miroslav Suchý</p>
<p style="font-size:0.55em; color:rgba(255,255,255,0.6);">Original materials were created by Tom "spot" Callaway</p>

---

<!-- SLIDE 2 -->

## Things to do to prepare your environment

- Packages that you will need installed:

```bash
sudo dnf install fedora-packager rpm-build rpmdevtools rpmlint patch
```

- Get a copy of the files we will be working with:
  - [`materials/`](https://github.com/fedora-copr/presentations/tree/main/rpm-packaging-workshop-for-beginners/materials) folder in this repository

- Use the `rpmdev-setuptree` command to create `~/rpmbuild` directory tree:

```
[jkyjovsk@fedora ~]$ rpmdev-setuptree
[jkyjovsk@fedora ~]$ tree ~/rpmbuild/
/home/jkyjovsk/rpmbuild/
├── BUILD
├── RPMS
├── SOURCES
├── SPECS
└── SRPMS

6 directories, 0 files
[jkyjovsk@fedora ~]$
```

Note:

- make sure everyone has the packages installed
- download the enum tarball and patch NOW

---

<!-- SLIDE 3 -->

## Agenda

Intro to RPM, create a simple RPM package from scratch

- **Assumptions**
  - You know how to use a text editor (no matter which one)
  - You know how to manually build "normal" software for Linux
  - You know what is a patch and how to apply it

- **Limitations**
  - This workshop covers a simple piece of software
  - Most packages will be a bit more complicated
    - Some will be a LOT more complicated

- **Information**
  - Feel free to ask questions! Or for a break!

---

<!-- SLIDE 4 -->

<!-- .slide: class="section-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 100%)" -->

## <!-- .element: style="color:#fff;" --> Objectives — RPM Package Management

<div style="color:rgba(255,255,255,0.9);">

- Why to use RPM packages?
- Can package be problematic?
- What is source and binary package?
- Package file name vs. package name
- Basic commands

</div>

---

<!-- SLIDE 5 -->

## Packaging as a standard (aka, why package at all?)

<div class="two-col">
<div>

- Auditing software usage — What, where?
- Version control
- Reproducible installations (Kickstart integration via anaconda, Ansible)
- Minimizes risk
  - Security
  - Rogue Applications
  - Licensing
  - Trusted provider

</div>
<div>

<div class="box-warn" style="margin-top:1em;">
⚠️ So you see why <code>sudo make install</code> is just not enough...
</div>

</div>
</div>

Note:

- packages gives management tool
- sudo make install doesn't track anything
- proper packages integrate with the system properly

---

<!-- SLIDE 6 -->

## RPMs works well

<div class="two-col">
<div>

- RPM itself is solid technology
- Package creation is easier than you think
- Easy to install and remove
- The quality depends on the packager

</div>
<div>

- You can write good software and bad software
- And you can write good packages and bad packages

<div class="box-green" style="margin-top:1em;">
✅ Our goal today: learn to write <strong>good</strong> packages!
</div>

</div>
</div>

---

<!-- SLIDE 7 -->

## RPM Usage

- RPM is archive (actually CPIO, try `/bin/mc` to step inside)
- Binary (built) package [`pkg-workshop-1-0.x86_64.rpm`](https://github.com/fedora-copr/presentations/tree/main/rpm-packaging-workshop-for-beginners/materials/pkg-workshop-1-0.x86_64.rpm)
  - ⚠️ File name is **different** from package name

<div class="two-col" style="font-size:0.85em;">
<div>

Install packages with file name:

```bash
# i for install, v for verbose, h for process hash
rpm -ivh pkg-workshop-1-0.x86_64.rpm
```

Query installed package with package name:

```bash
# q for query, l for list files
rpm -ql pkg-workshop
```

</div>
<div>

Remove package with package name:

```bash
# e for erase
rpm -eh pkg-workshop
```

List all installed packages in RPM database:

```bash
# info about package
rpm -qa
rpm -qi <pkgname>
```

</div>
</div>

<div class="box" style="font-size:0.85em;">
ℹ️ There's DNF5/DNF/YUM on top of RPM database, but that's not the topic for today.
</div>

Note:

- rpm is the low-level tool
- file name vs package name — common source of confusion

---

<!-- SLIDE 8 -->

## Source RPM Overview

- Source Package [`pkg-workshop-1-0.src.rpm`](https://github.com/fedora-copr/presentations/tree/main/rpm-packaging-workshop-for-beginners/materials/pkg-workshop-1-0.src.rpm)
  - SRPMs contain sources/patches/spec file used to generate binary RPM packages

- Install SRPM package with SRPM file name:

```bash
# i for install, v for verbose, h for process hash
rpm -ivh pkg-workshop-1-0.src.rpm
```

- Source packages just install source into defined source directory
  - Red Hat default: `~/rpmbuild/SOURCES`
- SRPMs do not go into the RPM database

- Remove installed SRPM with spec file name:

```bash
rpmbuild --rmsource --rmspec pkg-workshop.spec
```

---

<!-- SLIDE 9 -->

## More Source RPM Overview

- Making a binary rpm from SRPM:

```bash
rpmbuild --rebuild pkg-workshop-1-0.src.rpm
```

- Making a binary rpm from spec file:

```bash
# -b for build, -a for producing all (sub)packages, src.rpm and binary
rpmbuild -ba pkg-workshop.spec
```

---

<!-- SLIDE 10 -->

<!-- .slide: class="section-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 100%)" -->

## <!-- .element: style="color:#fff;" --> Objectives — Spec file

<div style="color:rgba(255,255,255,0.9);">

- What is a SPEC file
- Generators
- Basic syntax:
  - RPM Macros
  - Comments
- Best practices

</div>

---

<!-- SLIDE 11 -->

## Cooking with Spec Files

<div class="two-col">
<div>

- It's a text file
- Think of a spec file as a recipe
- Defines the contents of the RPMs
- Describes the process to build, install the sources
- Required to make packages
- Contains shell scripts

</div>
<div>

### Sections/stages:

1. Preamble — metadata
2. Setup (`%prep`)
3. Build (`%build`)
4. Install (`%install`)
5. Clean (`%clean`)
6. Files (`%files`)
7. Changelog (`%changelog`)

</div>
</div>

Note:

- all the sections listed, we'll go through each one

---

<!-- SLIDE 12 -->

## Common mistakes new packagers make

<div class="two-col">
<div>

### ❌ Spec file generators

- Remember, functional is not the same as good.

### ❌ Packaging pre-built binaries, not building from source

- (Technically) possible, but you shouldn't start here if you can help it
- Not permitted in Fedora

</div>
<div>

### ❌ Disabling automatic checks

- This is a recipe for disaster, they exist for a reason
- For example "installed but unpacked" check (you'll see later..)

</div>
</div>

---

<!-- SLIDE 13 -->

## RPM Macros

- Similar to shell variables
  - They can act as integers or strings, but it's easier to always treat them as strings
  - Recursively expanded: `%{_bindir}` → `%{_exec_prefix}/bin` → `/usr/bin`

- Macro formats: `%{foo}` and `%foo`
  - Some macros have environment variable variant, e.g. `$RPM_BUILD_ROOT` vs. `%buildroot` — they hold the same value, but for your sanity (and guidelines), you should consistently use one type of macro in a spec file.

- Many common macros come predefined
  - `rpm --showrc` will show you all the defined macros
    - the numbers in output [explanation](https://unix.stackexchange.com/questions/350842/what-does-14-mean-in-a-dump-of-rpm-macros)
  - `rpm --eval %macroname` will show you what a specific macro evaluates to
  - Most system path macros begin with an `_` (e.g. `%{_bindir}`)

---

<!-- SLIDE 14 -->

## RPM Comments

- To add a comment to your RPM spec file, simply **start a new line** with a `#` symbol.
  - ❌ Don't: `Version: 0.0.0.1  # beta, but cool!`

- Good example:

```text
# I have to delete this file, or else it will not build properly
rm -f foo/bar/broken.c
```

- RPM ignores comment lines entirely
  - Well, to be fair, this isn't true — if you comment out a macro definition, it will evaluate it anyways. Use double `%`:

```text
Before: # %configure          ← WRONG, still runs!
After:  # %%configure         ← CORRECT, escaped
```

<div class="box-warn">
⚠️ Note that macros are Turing complete! <code># %(rm -rf stg)</code> — this WILL execute!
</div>

---

<!-- SLIDE 15 -->

## Custom rpm macros `~/.rpmmacros`

- Syntax: `%macroname value`
- Overrides for system-defined macros `/usr/lib/rpm/`
- Can be overwritten directly in spec file:
  - Syntax: `%global macroname value`

- Example: `%_smp_mflags` expands to `-j<N>` (number of CPU cores for parallel make)

<div class="box-warn">
⚠️ You can make your own macros here, be careful! (why?) <br>
... so, <strong>don't rely on them in spec file</strong> — other builders won't have your <code>~/.rpmmacros</code>!
</div>

Note:

- note - rozdelit box-warn

---

<!-- SLIDE 16 -->

## Fedora Packaging Guidelines

- Intended to document a set of "rules" and "best practices"
- Living document, constantly being amended and improved
- Exceptions are possible
  - Common exception cases are usually documented
  - If you can justify doing something differently, it is usually permissible, although, it may need to be approved by the [Fedora Engineering Steering Committee](https://docs.fedoraproject.org/en-US/fesco/) (FESCo)
  - Use common sense, but when in doubt, defer to the guidelines

<div style="font-size:0.9em;">
<a class="link-card" href="https://docs.fedoraproject.org/en-US/packaging-guidelines/">📖 <strong>https://docs.fedoraproject.org/en-US/packaging-guidelines/</strong></a>
</div>

Note:

- guidelines evolve with the distribution

---

<!-- SLIDE 17 -->

<!-- .slide: class="section-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 100%)" -->

## <!-- .element: style="color:#fff;" --> Objectives — real-life spec — preamble

<div style="color:rgba(255,255,255,0.9);">

- What is a preamble?
- What tags can be defined in a preamble?
- Write simple preamble section.

</div>

---

<!-- SLIDE 18 -->

## Understanding the Spec File: Preamble

<div class="two-col">
<div>

- Initial section — mostly metadata (typically no scripts)
  - Defines output of `rpm -qi <package>`
- Defines package characteristics
  - And custom macro definitions

</div>
<div>

```bash
[jkyjovsk@fedora]$ rpm -qi tar
Name        : tar
Epoch       : 2
Version     : 1.35
Release     : 6.fc43
Architecture: x86_64
Install Date: Mon Jan  5 06:47:02 2026
Group       : Unspecified
Size        : 3093037
License     : GPL-3.0-or-later
Signature   :
              RSA/SHA256, Mon Jul 28 01:00:50 2025, Key ID 829b606631645531
Source RPM  : tar-1.35-6.fc43.src.rpm
Build Date  : Sat Jul 26 08:44:17 2025
Build Host  : buildhw-x86-02.rdu3.fedoraproject.org
Packager    : Fedora Project
Vendor      : Fedora Project
URL         : https://www.gnu.org/software/tar/
Bug URL     : https://bugz.fedoraproject.org/tar
Summary     : GNU file archiving program
Description :
The GNU tar program saves many files together in one archive and can
restore individual files (or all of the files) from that archive. Tar
can also be used to add supplemental files to an archive and to update
or list files in the archive. Tar includes multivolume support,
automatic archive compression/decompression, the ability to perform
remote archives, and the ability to perform incremental and full
backups.

If you want to use tar for remote backups, you also need to install
the rmt package on the remote box.
```

</div>
</div>

---

<!-- SLIDE 19 -->

## Creating a new spec file

- A spec file is a text file, grab a text editor

- RPM expects spec files to be in `~/rpmbuild/SPECS/`
  - Technically, it doesn't care, but for sanity, lets just keep them there.

- Go ahead and open a new text file called `~/rpmbuild/SPECS/enum.spec`

```bash
rpmdev-setuptree && rpmdev-newspec ~/rpmbuild/SPECS/enum.spec
```

Note:

- create the file manually or use rpmdev-newspec
- some text editors (e.g. neovim) may have prepared template

---

<!-- SLIDE 20 -->

## Preamble Items

Here is a blank preamble section, this is where we will start our package!

```text
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

<!-- SLIDE 21 -->

## Name

First, lets fill in the name of our package, which is "enum".

```text
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

---

<!-- SLIDE 22 -->

## Version

```text
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

---

<!-- SLIDE 23 -->

## Release

```text
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:
License:
URL:
Source0:

%description
```

- The Release field is where you track your package builds, starting from 1 (guidelines), and incrementing by 1 each time you make a change.

Note:

- incremented for packaging changes (not upstream changes)
- upstream vs downstream

---

<!-- SLIDE 24 -->

## Wait, what is that `%{?dist}` thing?

- It is a macro!
- It is there to add an identifier (or dist) tag to the end of the release field. For humans!
- The `?` means "if defined, use it, if not defined, evaluate to nothing"

- So, if your release field is:

```text
Release: 1%{?dist}
```

- Then, it evaluates to `1.fc42` on Fedora 42, and `1.el10` on RHEL 10.

<div class="box">
ℹ️ More info: <a href="https://docs.fedoraproject.org/en-US/packaging-guidelines/DistTag/">https://docs.fedoraproject.org/en-US/packaging-guidelines/DistTag/</a>
</div>

---

<!-- SLIDE 25 -->

## Summary

```text
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:
URL:
Source0:

%description
```

- Summary is a single sentence describing what the package does. It does not end in a period, and is no longer than 80 characters.

<div class="box">
ℹ️ We'll fill in a longer description of the package in <code>%description</code>.
</div>

---

<!-- SLIDE 26 -->

## License

```text
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:
Source0:

%description
```

- The License tag is where we put the short license identifier (or identifiers) that reflect the license(s) of files that are built and included in this package.

- It is easiest to determine the correct license once we have an unpacked source tree, so we'll put "TODO" in this field, and fix it later.

---

<!-- SLIDE 27 -->

## URL

```text
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:        https://fedorahosted.org/enum
Source0:

%description
```

- The URL tag is a link to the software homepage.

Note:

- URL points to upstream project page (NO LONGER EXISTS)
- helps users find more info about the software

---

<!-- SLIDE 28 -->

## Source0

```text
Name:       enum
Version:    1.1
Release:    1%{?dist}
Summary:    Seq- and jot-like enumerator
License:    TODO
URL:        https://fedorahosted.org/enum
Source0:    https://fedorahosted.org/releases/e/n/enum/%{name}-%{version}.tar.bz2

%description
```

- The Source0 tag tells the rpm what source file to use. You can have multiple `SourceN` entries, if you need them. Put the full upstream URL where you downloaded the file.

<div class="box" style="font-size:0.85em;">
ℹ️ <code>rpmbuild</code> takes the basename. Full URL is mostly for humans.
</div>

Note:

- Source0 is the main source tarball
- can have Source1, Source2, etc. for additional files

---

<!-- SLIDE 29 -->

## Wait, why did you use macros there?

- You should have noticed that I used `%{name}` and `%{version}` in the Source0 URL.
- `%{name}` evaluates to whatever we have set as Name.
- `%{version}` evaluates to whatever we have set as Version.
- By doing this, it means that we should not have to change the Source0 line as new versions release (or if upstream changes the name).
- In fact, all of the fields in the preamble are defined as macros, in the exact same way!
- In your spec files, you should try to use these macros whenever possible.

Note:

- all preamble fields become macros you can reference
- when you bump Version, Source0 updates automatically

---

<!-- SLIDE 30 -->

## Copy sources to `~/rpmbuild`

<div class="box">
ℹ️ This is a great time to copy (not unpack) the source tarball and patch into <code>~/rpmbuild/SOURCES/</code>
</div>

```bash
cp materials/enum-1.1.tar.bz2 ~/rpmbuild/SOURCES/
cp materials/enum-1.1-use-putchar.patch ~/rpmbuild/SOURCES/
```

Note:

- rpmbuild will handle unpacking via %setup

---

<!-- SLIDE 31 -->

## `%description`

- `%description` indicates to RPM that you are entering a block of text which describes the package.
- This can be multiple lines, but should be concise and describe the functionality of the package.
- No line in the `%description` can be longer than 80 characters and it must end with a period.
- Try not to simply repeat the summary.

```text
%description
Utility enum enumerates values (numbers) between two values, possibly
further adjusted by a step and/or a count, all given on the command line.
Before printing, values are passed through a formatter. Very fine control
over input interpretation and output is possible.
```

---

<!-- SLIDE 32 -->

## Complete Preamble

```text
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

---

<!-- SLIDE 33 -->

## Preamble: Explicit Requires

`Requires` – This lists any packages which we know are necessary to be present on the system to **run** the software in our package, once it is installed.

- RPM usually does a very good job of autodetecting dependencies and adding them for you, especially when the software is in C, C++, Perl, etc.
- Think twice if you need to be explicit.
- Requires can be versioned:

```text
Requires: bar >= 2.0
Requires: bar < 10.0.0
```

---

<!-- SLIDE 34 -->

## Preamble: BuildRequires

- `BuildRequires` – This lists the packages which need to be present to build the software.

- Most packages have at least one BuildRequires:

```text
BuildRequires: make
```

- We will see later if our package needs some BuildRequires.

- You can list as many packages as BuildRequires as you need, although, you should try to avoid redundant items. Also, BuildRequires can be versioned:

```text
BuildRequires: bar >= 2.0
```

---

<!-- SLIDE 35 -->

## Preamble: `Patch<N>`

`Patch0` – If you need to apply a patch to the software being packaged, you can add a numbered patch entry here:

```text
Patch0:     enum-1.1-use-putchar.patch
```

- Patch can be a full URL as well (like `Source<N>`), if it makes sense.

Note:

- patches are numbered: Patch0, Patch1, etc.
- can be URLs or just filenames (stored in ~/rpmbuild/SOURCES/)

---

<!-- SLIDE 36 -->

## `%if` condition

How to handle different OSes with one spec? Use macros and conditions:

```text
## BUGs!
%if 0%{?rhel} <= 6 || 0%{?fedora} < 17
Requires: ruby(abi) = 1.8
%else
Requires: ruby(release)
%endif
```

Note:

- note - rozdelit bug
- conditionals let you handle multiple distro versions in one spec
- 0%{?macro} pattern: evaluates to 0 if macro is undefined
- use sparingly — keep specs simple when possible

---

<!-- SLIDE 37 -->

## Preamble: Explicit Provides

- `Provides:` tells rpm that this package provides something else.
  - E.g. Httpd `Provides: webserver`, nginx too, and some package `Requires: webserver`.

```text
Provides: webserver
```

- Note: RPM 4.13+ [boolean dependencies](https://rpm-software-management.github.io/rpm/manual/boolean_dependencies.html):

```text
Requires: (pkgA or pkgB or pkgC)
```

Note:

- allows virtual package dependencies

---

<!-- SLIDE 38 -->

<!-- .slide: class="section-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 100%)" -->

## <!-- .element: style="color:#fff;" --> Objectives — real spec — continued

<div style="color:rgba(255,255,255,0.9);">

In this chapter you will:

- Learn about main sections of SPEC file: prep, build, install, files and changelog
- Learn about licenses
- Learn about scriptlets
- How to build the binary package from SPEC

</div>

---

<!-- SLIDE 39 -->

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

```text
%prep
%setup -q
%patch 0 -p1
```

<div class="box-green" style="font-size:0.85em;">
✅ Modern alternative: <code>%autosetup -p1</code>
</div>

</div>
</div>

---

<!-- SLIDE 40 -->

## Prep & Setup

- First, we need to add a `%prep` line to tell rpm that we're in the %prep phase.
- `%setup` is a very powerful (and complicated) "macro" (builtin) that is included with RPM. It is used to unpack `Source#` files, into `~/rpmbuild/BUILD/`

So, below our `%description` text, we'll add:

```text
%prep
%setup -q
```

- The `-q` option tells `%setup` to unpack the Source file quietly. If you want to see what is happening here, you can omit it, but it usually is a good thing to keep the build logs small and easy to read.
- By default, `%setup` unpacks `Source0` only. It is possible to use `%setup` to unpack multiple `Source#` files at once, for more details on complicated use cases, see Maximum RPM docs.

Note:

- %setup -q = quiet unpack of Source0
- multiple sources require special %setup flags
- for now, we only have one source

---

<!-- SLIDE 41 -->

## Prep: Other items

- `%patch 0` – let's specify `Patch0` entry in our spec, and apply it here with the matching `%patch N` macro. Some common options that are good to know:
  - `-p#` — the patch level (how many directories deep does this patch apply)
  - `-b .foo` — a patch suffix, appended to the original files before patching. This is very useful when you need to update or change a patch.

- So, for example, a spec with:

```text
Patch0: enum-1.1-use-putchar.patch
```

would also need:

```text
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

<!-- SLIDE 42 -->

## `%prep`

Here's what our spec looks like now (try `rpmbuild -bp enum.spec`):

```text
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

<!-- SLIDE 43 -->

## Understanding the Spec: Build

<div class="two-col">
<div>

- Binary components created ("compiled") within `~/rpmbuild/BUILD`
- Use the included `%configure` macro for good defaults

</div>
<div>

### Example of a `%build` section:

```text
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

<!-- SLIDE 44 -->

## Build

Here's what our spec looks like now.

```text
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

<!-- SLIDE 45 -->

## Understanding the Spec: Install

- Creates buildroot, `~/rpmbuild/BUILDROOT` — a directory where all build artifacts are installed on the final path. This can include all non-compiled files which should be in final package: documentation, examples, man pages, data files.
- Lays out filesystem structure:

```bash
mkdir -p %{buildroot}/var
mkdir -p %{buildroot}/%{_bindir}
```

- Puts built files in buildroot:

```bash
cp -a result-of-make/my-application %{buildroot}/%{_bindir}/my-application
```

- Cleans up unwanted installed files (if needed):

```text
%make_install          # installs too much stuff
rm -rf %{buildroot}/%{_datadir}/non-free/
```

Note:

- buildroot is a fake root filesystem
- all files installed there as if it were /
- RPM collects files from buildroot into the package

---

<!-- SLIDE 46 -->

## Fixing our Install Section

- Our build section is done now. Now, we need to fix up our `%install` section. We know that we need to use "`make install`" to install... try it now.
- ... but RPM doesn't want to install the files into their positions on `/`. We need to install the files into our BuildRoot, so that RPM can collect them and package them up in the binary rpm file.
- Here's how you do this. Add this line below `%install`:

```text
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

<!-- SLIDE 47 -->

## Install

```text
BuildRequires: asciidoc
...

%build
%configure --disable-doc-rebuild
%make_build

%install
%make_install
```

<div class="box" style="font-size:0.85em;">
ℹ️ Old variants (don't use anymore):<br>
<code>make %{?_smp_mflags}</code> → use <code>%make_build</code><br>
<code>rm -rf $RPM_BUILD_ROOT</code> → not needed nowadays<br>
<code>make install DESTDIR=%{buildroot}</code> → use <code>%make_install</code>
</div>

Note:

- we discovered we need asciidoc as BuildRequires
- --disable-doc-rebuild may be needed for some packages
- use modern macros: %make_build, %make_install

---

<!-- SLIDE 48 -->

## Understanding the Spec: `%files`

<div class="two-col">
<div>

- `%files`: List of package contents
  - If it is not in `%files`, it is not in the package.
  - RPM WILL complain about unpackaged files.

</div>
<div>

- We'll come back to this section at the end, when we know what to put in it. For now, lets just define the section, by adding the `%files` line below our `%install` section:

```text
%files
```

</div>
</div>

Note:

- %files is crucial — it defines what ends up in the RPM
- empty %files = empty package (but rpmbuild will complain about leftover files)
- we'll fill it in after we know what got installed

---

<!-- SLIDE 49 -->

## Understanding the Spec: Changelog

- Used to track package changes
- Not intended to replace source code Changelog
- Provides explanation for package users, audit trail
- Update on every change

### Example of Changelog section:

```text
%changelog
* Mon Jun 2 2008 Tom "spot" Callaway <tcallawa@redhat.com> - 1.1-3
- minor example changes

* Mon Apr 16 2007 Tom "spot" Callaway <tcallawa@redhat.com> - 1.1-2
- update example package

* Sun May 14 2006 Tom "spot" Callaway <tcallawa@redhat.com> - 1.1-1
- initial package
```

Note:

- changelog tracks packaging changes, not upstream changes
- strict format: * Day Mon DD YYYY Name <email> - Version-Release
- each change on a new line starting with -

---

<!-- SLIDE 50 -->

## Changelog

- Below our `%files` section, as the last item in the spec, add a line for changelog:

```text
%changelog
```

- Then, lets add our first changelog entry, in the proper layout:

```text
* Mon Feb 23 2026 Your Name Here <youremail@here> - 1.1-1
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

<!-- SLIDE 51 -->

## Spec File Status

```text
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
%autosetup -p1

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

<!-- SLIDE 52 -->

## Building our source tree

- Now, we can use that source tree to help us fill in the blanks we left earlier — `License: TODO`
- At this point, we can use our spec to build our source tree and take a look around it.
- Save your spec file, and run (as a normal user):

```bash
rpmbuild -bp ~/rpmbuild/SPECS/enum.spec
```

- The `-bp` option tells rpmbuild to run through the `%prep` stage, then stop.
- It should complete without errors, and you should see a new directory in `~/rpmbuild/BUILD/enum-1.1/`

Note:

- -bp = build prep only
- now we can inspect the source tree
- look for license files, README, build system

---

<!-- SLIDE 53 -->

## Licensing

As a responsible Fedora packager, it is important that you do the licensing correct for your package.

Here are some general steps to follow:

1. Is there a `COPYING` or `LICENSE` file? If so, read it, and remember its file name, because we'll want to include it in our package.
2. Is there a `README` file? Read it, and look for any mention of "Copyright" or "License".
3. Look at the actual source files in your text editor. Some code projects will describe their license in the header comments of each source file.
4. Note all licenses that you see, then look them up in the Fedora Licensing chart.

<div class="box">
ℹ️ <a href="https://docs.fedoraproject.org/en-US/legal/allowed-licenses/">Fedora allowed licenses</a>
</div>

What license do you find for enum?

Note:

- licensing is a critical responsibility
- check COPYING, LICENSE, README, source headers
- all licenses must be on the Fedora allowed list

---

<!-- SLIDE 54 -->

## Licensing Part Two

- `enum` is licensed under the BSD 3-Clause Licence. In Fedora, the short name identifier for this license is `BSD-3-Clause`.
- Licensing can be very complicated! When in doubt, feel free to email `fedora-legal@lists.fedoraproject.org` or `legal@fedoraproject.org` to get help.
- Now, we need to fix our spec. Open it up in a text editor again, and change the License tag from `TODO` to `BSD-3-Clause`
- Also, did you see that file `COPYING`? We need to make sure they are installed in our package, so we'll add them to our `%files` list, using a macro called `%license` (formerly `%doc` was used).

<div class="two-col" style="font-size:0.85em;">
<div>

- Audit tools: `licensecheck` helper, `askalono-cli` package
- License changes must be announced on developer list

</div>
<div>

- Multiple Licensing Scenarios: `LGPL-2.0-or-later AND MIT`
- Watch out for code copied from other projects (different license may apply to that portion)

</div>
</div>

Note:

- BSD-3-Clause is the SPDX identifier
- %license is the modern way to mark license files
- multiple licenses use AND/OR operators
- always ask legal@ when unsure

---

<!-- SLIDE 55 -->

## Understanding `%doc`

- `%doc` is a special macro that is used to:
  - Mark files as documentation inside an RPM (`rpm -qd tar`)
  - Copy them directly from the source tree in `~/rpmbuild/BUILD/enum-1.1/` into the "docdir" for your package, ensuring that your package always has them.

- `%license` is similar — license-related "documentation" (`rpm -qL tar`)

- So, lets add a line to `%files` for our license texts, so that it now looks like this:

```text
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

<!-- SLIDE 56 -->

## How Does Enum Build and Install?

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

<!-- SLIDE 57 -->

## History Lessons

- Before Fedora 12 (and in RHEL 5 or older), it used to be necessary to manually remove the `%{buildroot}` as the very first step in the `%install` stage, like this:

```text
%install
rm -rf %{buildroot}
```

With Fedora 12 (or newer) RPM, the `%install` stage automatically deletes the `%{buildroot}` for you as the very first step, so this is no longer necessary.

- Also, it used to be necessary to define a `%clean` section to clean up the `%{buildroot}` at the end of the package build process, it looked like this:

```text
%clean
rm -rf %{buildroot}
```

With Fedora 12+ RPM, this `%clean` section is handled internally and does not need to be explicitly defined.

Note:

- historical context — you'll see these in old specs
- modern rpmbuild handles both automatically
- remove them if you see them in specs you're updating

---

<!-- SLIDE 58 -->

## History Lessons #2

- In the recent past, there was a mandatory field in the Preamble statement called `BuildRoot` — it is now defined automatically (EL6+). You can drop such lines:

```text
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
```

<div class="box" style="font-size:0.9em;">
ℹ️ Don't add <code>BuildRoot</code>, <code>%clean</code>, or <code>rm -rf %{buildroot}</code> to new specs — they're obsolete.
</div>

Note:

- BuildRoot was mandatory before EL6
- modern RPM defines it automatically
- remove from old specs when updating

---

<!-- SLIDE 59 -->

## Status

- Okay, history lesson over. Your spec should have a fleshed out `%build` and `%install` by now.
- Save your spec file out. There is one thing we're missing from our spec, the list of files to go into `%files`! I'm about to share a clever trick on how to make it easier.

Note:

- verify your spec matches what we've built so far
- the clever trick is coming up next — let rpmbuild tell you what files to include

---

<!-- SLIDE 60 -->

## Build our package

Now, as a normal user run:

```bash
rpmbuild -ba ~/rpmbuild/SPECS/enum.spec
```

- The `-ba` options tell rpmbuild to build "all", source and binary packages.
- This is going to run through `%build`, then `%install` ... and then **fail**, because we don't have a complete `%files` list specified.

Note:

- -ba = build all (source + binary packages)
- it WILL fail — that's expected!
- the failure output is actually very helpful

---

<!-- SLIDE 61 -->

## Build our package (output)

But, when it fails, it does us a favor, check out the output!

```
RPM build errors:
    Installed (but unpackaged) file(s) found:
    /usr/bin/enum
    /usr/lib/debug/usr/bin/enum-1.1-1.fc42.x86_64.debug
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

<!-- SLIDE 62 -->

## Adding missing `%files`

```text
%files
%license COPYING
%doc ChangeLog
%{_mandir}/man1/enum.1*
%{_bindir}/enum
```

We skipped the debug file, because once we added the corresponding executable then rpmbuild picks the debug file automatically.

Note:

- use macros for paths: %{_bindir}, %{_mandir}
- debuginfo is handled automatically
- wildcards (enum.1*) handle compression (.gz)

---

<!-- SLIDE 63 -->

## Files

- You may also add a `%defattr` line. The `%defattr` macro tells RPM what to set the default attributes to for any and all files in the `%files` section. The Fedora default is `(-,root,root,-)`. You do not need to define it again.

```text
%attr(<file mode>, <user>, <group>, <dir mode>)
```

<div class="box">
ℹ️ <a href="http://ftp.rpm.org/max-rpm/s1-rpm-specref-files-list-directives.html">http://ftp.rpm.org/max-rpm/s1-rpm-specref-files-list-directives.html</a>
</div>

Note:

- %defattr sets default file ownership/permissions
- Fedora default is (-,root,root,-) — no need to specify
- use %attr for individual files that need special permissions

---

<!-- SLIDE 64 -->

## Almost done

- At this point, make sure you have all useful documentation listed in `%files` as `%doc`, not just the license text. Look for `README` and `ChangeLog`.
- `INSTALL` is usually not very helpful, do not install it.
- That should be it! Look over your spec and make sure you're happy with it, then save it, and run:

```bash
rpmbuild -ba ~/rpmbuild/SPECS/enum.spec
```

Note:

- double-check documentation files
- INSTALL is just build instructions — not useful for end users
- save and build!

---

<!-- SLIDE 65 -->

## Status Check

- At this point, you should now have a `enum-1.1-1.src.rpm` and one arch rpm: `enum-1.1-1.fc*.*.rpm` (the Fedora versions and architectures will vary, depending on your system).
- If so, congratulations! You're on your way to really understanding how to make good Fedora packages!
- If it failed, no worries. Take a look at the last few lines that RPM output, and it will probably give you an idea of what to fix. Feel free to ask for help.
- The next step is to check the package for minor issues, and you use a tool called `rpmlint` for this. Run:

```bash
rpmlint ~/rpmbuild/SRPMS/enum-1.1-1.src.rpm ~/rpmbuild/RPMS/*/enum*.rpm
```

- If you find any errors, try to correct them in the spec and rebuild. If you do make changes to your spec file, increment your Release and add a new changelog entry at the top of your `%changelog` section!

Note:

- congratulations on building your first package!
- rpmlint is the quality checker
- fix errors, bump Release, add changelog, rebuild
- iterate until rpmlint is clean

---

<!-- SLIDE 66 -->

## Bonus — RPM Scriptlets

- Shell code sections executed at certain times during package installation: `%pre`, `%post`, `%preun`, `%postun`
- Scriptlets are non-interactive, no arguments, macros are expanded at package build time and baked-into the RPM file
- Remember, RPM DB doesn't track what is done here
- The best intentions can easily go evil (it is hard to get scriptlets right), but sometimes are necessary (but distribution development is trying to convert them to a declarative format, like with system-users creation)
- More info: RPM packaging guide and Fedora guidelines.

Note:

- scriptlets run during install/remove of the package
- they're powerful but dangerous
- prefer declarative alternatives (sysusers.d, tmpfiles.d, etc.)
- if you must use them, test thoroughly

---

<!-- SLIDE 67 -->

## Best Practices

- **K.I.S.S.** — Keep It Simple
- Use patches, not rpm hacks
- Avoid scriptlets, minimize wherever possible
  - Leverage triggers instead (fedora docs)
- Use `%changelog`
- Look at and learn from other Fedora packages
  - Huge tarball with all spec files
- Use macros sanely
  - Be consistent
  - Utilize system macros

Note:

- KISS is the number one rule
- existing packages on src.fedoraproject.org are a goldmine
- consistency is key — pick a style and stick with it

---

<!-- SLIDE 68 -->

## Do not build a package as root

<div class="box-warn" style="font-size:1.1em;">
⚠️ Do <strong>NOT EVER</strong> build RPMS as root.<br>
Let me repeat, do <strong>NOT EVER</strong> build RPMS as root.
</div>

- Ideally run under a separate build-specific user (use mock ideally)

### Why? Look at this:

```text
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

<!-- SLIDE 69 -->

## Better than Best Practices

- Use `rpmlint`, fix warnings/errors
- Include configs/scripts as `Source` files
- Comment!
  - ...but keep it legible
  - Think of the guy who will have to fix your package when you leave.
- Don't ever call `/bin/rpm*` from inside a spec file.
  - RPM is NOT re-entrant

Note:

- rpmlint is your quality gate
- document your spec with comments
- never call rpm commands from within a spec — it's not re-entrant
- think about maintainability

---

<!-- SLIDE 70 -->

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

<!-- SLIDE 71 -->

## Useful Links

<div style="font-size:0.8em;">
<a class="link-card" href="https://docs.fedoraproject.org/en-US/packaging-guidelines/">📖 <strong>Fedora Packaging Guidelines</strong></a>
<a class="link-card" href="https://docs.fedoraproject.org/en-US/packaging-guidelines/ReviewGuidelines/">📋 <strong>Review Guidelines</strong></a>
<a class="link-card" href="https://rpm-software-management.github.io/rpm/manual/spec.html">📚 <strong>RPM spec file reference</strong></a>
<a class="link-card" href="https://rpm-packaging-guide.github.io/">📘 <strong>RPM Packaging Guide</strong></a>
<a class="link-card" href="https://src.fedoraproject.org/">💻 <strong>Fedora dist-git</strong> — contains lots of example specs</a>
<a class="link-card" href="https://lists.fedoraproject.org/archives/list/packaging@lists.fedoraproject.org/">✉️ <strong>Fedora packaging mailing list</strong></a>
<a class="link-card" href="https://github.com/rpm-software-management/rpmlint">🔍 <strong>rpmlint on GitHub</strong></a>
<a class="link-card" href="https://rpm.org/documentation.html">📄 <strong>RPM.org documentation</strong></a>
</div>

Note:

- these are your go-to references
- Fedora GIT tree is a gold mine of real-world spec files
- the mailing list is great for getting help

---

<!-- SLIDE 72 -->

<!-- .slide: class="section-slide" data-background="linear-gradient(135deg, #294172 0%, #3c6eb4 100%)" -->

## <!-- .element: style="color:#fff;" --> Q&A

<!-- .element: style="font-size:3em;" --> ❓

Note:

- open the floor for questions

---

<!-- SLIDE 73 -->

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
