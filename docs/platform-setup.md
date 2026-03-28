# Platform Setup

The SQLite driver (`better-sqlite3`) is a native module. It ships prebuilt binaries for most setups, so `npm install` usually just works. If it fails with a build error, install the tools below for your OS.

## macOS

```bash
xcode-select --install
```

## Windows

**Easiest:** During Node.js installation, check **"Automatically install the necessary tools"**.

**Already have Node?** Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload.

Avoid spaces in the project path — the build tool doesn't handle them well on Windows.

## Linux (Debian / Ubuntu)

```bash
sudo apt-get install build-essential python3
```

## Linux (Fedora / RHEL)

```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install python3
```

## Linux (Alpine / Docker)

```bash
apk add python3 make gcc g++ linux-headers
```

## Still not working?

1. Make sure your Node.js version is 22 or higher: `node --version`
2. Try clearing the npm cache: `rm -rf node_modules && npm install`
3. Open an [issue](https://github.com/mordiaky/idea-lab-mcp/issues) with the full error output
