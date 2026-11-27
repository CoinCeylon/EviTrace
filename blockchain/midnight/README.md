# EviTrace Midnight Development Environment

## Purpose

Midnight provides the foundation for privacy-preserving
authorization and credential verification within EviTrace.

The intended use cases include:

- Private institutional credential verification.
- Analyst and supervisor authorization.
- Privacy-preserving forensic report approval.
- Zero-knowledge proof-based verification.
- Authorized institutional auditing.

These application-specific features are not yet implemented.

## Verified Environment

| Component | Version |
|---|---|
| Operating System | Ubuntu 24.04.2 LTS (WSL 2) |
| Architecture | x86_64 |
| Node.js | 22.23.5 |
| npm | 10.9.9 |
| Docker Desktop | 4.100.1 |
| Docker Engine | 29.9.3 |
| Docker Compose | 5.7.1 |
| Compact CLI | 0.5.3 |
| Compact Compiler | 0.36.1 |
| Proof Server | 9.0.2 |

## Target Compatibility

Based on the Midnight documentation updated on
November 25, 2026:

- Ledger: 9
- Compact Toolchain: 0.36.1
- Compact Language: 0.28.0
- Compact Runtime: 0.21.0
- Proof Server: 9.0.2

SDK and runtime package integration is pending.

## Prerequisites

- Linux or Ubuntu through WSL 2
- Docker Desktop with WSL integration enabled
- Node.js and npm
- Bash, curl, tar and unzip
- Google Chrome
- Visual Studio Code

## Compact Installation

Download the official installer:

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh \
-o /tmp/compact-installer.sh
```

Review the installer before executing it:

```bash
less /tmp/compact-installer.sh
sh /tmp/compact-installer.sh
source ~/.bashrc
```

Install the compatible compiler version:

```bash
compact update 0.36.1
```

Verify installation:

```bash
compact --version
compact compile --version
which compact
```

## Proof Server

Execute these commands from the repository root.

### Start

```bash
docker compose \
  -f blockchain/midnight/proof-server/docker-compose.yml \
  up -d
```

### Verify

```bash
docker ps
curl -i http://127.0.0.1:6300/
```

Expected HTTP status: 200 OK

Expected response contains: {"status":"ok"}

### View Logs

```bash
docker logs --tail 50 evitrace-midnight-proof-server
```

### Stop

```bash
docker compose \
  -f blockchain/midnight/proof-server/docker-compose.yml \
  stop
```

### Restart

```bash
docker compose \
  -f blockchain/midnight/proof-server/docker-compose.yml \
  start
```

## Verified Results

- Docker WSL integration verified.
- Docker container execution verified.
- Compact CLI installation verified.
- Compact compiler version verified.
- Proof Server Docker Compose configuration verified.
- Cryptographic resource initialization completed.
- Proof Server HTTP endpoint returned 200 OK.

## Security Requirements

- Keep the proof server bound to localhost during development.
- Do not expose the proof server directly to the public internet.
- Use synthetic data during development.
- Never commit wallet recovery phrases or private keys.
- Review verbose logging before processing confidential data.
- Do not use floating compiler or Docker image versions.

## Known Limitations

- Actual Compact contract compilation is pending.
- Midnight SDK integration is pending.
- Midnight wallet integration is pending.
- Network deployment is pending.
- Actual zero-knowledge proof generation is not yet tested.
- Existing repository dependency vulnerabilities remain unresolved.

## Official Resources

- https://docs.midnight.network/
- https://github.com/midnightntwrk/compact

## License

Apache-2.0
