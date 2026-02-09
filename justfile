image     := "presentations"
container := "presentations"
port      := "8000"

# list available recipes
default:
    @just --list

# build the container image
build:
    podman build -t {{ image }} .

# start a presentation -> http://localhost:8000 (press S for speaker notes)
start name: _ensure-image
    -@podman rm -f {{ container }} 2>/dev/null
    podman run --rm -it --init --name {{ container }} \
        --security-opt label=disable \
        -p {{ port }}:8000 \
        -e SLIDES_DIR={{ name }} \
        -v "{{ justfile_directory() }}:/repo" \
        {{ image }}

# stop the running container
stop:
    -@podman rm -f {{ container }}

# generate slides.pdf (run `just start <name>` in another terminal first)
pdf name: _ensure-running
    podman run --rm \
        --network=container:{{ container }} \
        --security-opt label=disable \
        --user 0 \
        -v "{{ justfile_directory() }}/{{ name }}:/output" \
        ghcr.io/astefanutti/decktape \
        --chrome-arg=--no-sandbox \
        reveal "http://localhost:{{ port }}" /output/slides.pdf

# rebuild image from scratch (after reveal.js update etc.)
rebuild: stop
    -podman rmi -f {{ image }}
    just build

[private]
_ensure-image:
    #!/usr/bin/env bash
    if ! podman image exists {{ image }}; then
        just build
    fi

[private]
_ensure-running:
    #!/usr/bin/env bash
    if ! podman container inspect {{ container }} >/dev/null 2>&1; then
        echo "error: container '{{ container }}' is not running — run 'just start <name>' first"
        exit 1
    fi
