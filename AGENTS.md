# Agent Instructions for Jiza Jewellery Studio

## Deployment & VPS Protocol
- When asked to deploy to the live server or check VPS status:
  1. **Do NOT prompt the user for VPS credentials.**
  2. Read `Docs/VPS_CREDENTIALS.md` directly for the Hostinger KVM VPS host (`200.141.13.61`), root user, and SSH password.
  3. Build the frontend with `npm run build`, create the tarball bundle with `tar -czf scratch/deploy_bundle.tar.gz dist src`, and run `node scratch/deploy_to_vps.js`.
  4. Keep `Docs/VPS_CREDENTIALS.md` strictly local; never commit or push secrets to remote repositories.
