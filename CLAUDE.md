# Claude Code Project Configuration

This file contains project-specific instructions and configurations for Claude Code.

## SSH Configuration

### Production Server Access

When connecting to the production server, use the pre-configured SSH key instead of password authentication.

**Server Details:**
- **Host:** 185.246.118.162
- **User:** root
- **SSH Key:** ~/.ssh/github-actions-eramessage
- **Domain:** eramessage.ru

**SSH Command to use:**
```bash
ssh -i ~/.ssh/github-actions-eramessage root@185.246.118.162
```

**IMPORTANT:** Always use the SSH key for server access. Never use password authentication for automated operations.

### SSH Key Location
- **Private Key:** `~/.ssh/github-actions-eramessage`
- **Public Key:** `~/.ssh/github-actions-eramessage.pub`

The SSH key has already been installed on the server and is ready to use.

## Project Structure

```
messenger/
├── backend/          # Node.js/Express/TypeScript backend
├── frontend/         # React/Vite frontend
├── .github/          # GitHub Actions workflows
│   └── workflows/    # CI/CD pipelines
├── nginx/           # Nginx configuration
└── docker-compose.production.yml  # Production deployment config
```

## Development Commands

### Local Development
```bash
# Start all services
npm run dev  # or use start-dev.bat on Windows

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev
```

### Production Deployment

**Automatic:** Push to main branch triggers automatic deployment via GitHub Actions

**Manual:**
```bash
# On server
cd /opt/messenger
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build
```

## Environment Variables

### Production Secrets (Already configured in GitHub Secrets)
- `DB_PASSWORD`: OYjPuKKHnutP3kLk1ld4JVOu7uRMXVFO
- `REDIS_PASSWORD`: KLuJGDkMv7FRYObVE8FsBXd09CeCbXOy
- `JWT_SECRET`: 85afb9802088f8a1d9dc00e3d7ce124cf58b97dd0af34c4e2b6f59dd668d59a1eeea95dd6860385aa12dd7f4c2688b00f44748469ec2784e4aeb8f0b4ac756d0

See `GITHUB_SECRETS.txt` for complete list.

## Server Operations

### Connect to Server
```bash
ssh -i ~/.ssh/github-actions-eramessage root@185.246.118.162
```

### Check Application Status
```bash
# On server
docker-compose -f /opt/messenger/docker-compose.production.yml ps

# Check logs
docker-compose -f /opt/messenger/docker-compose.production.yml logs -f
```

### Restart Services
```bash
# On server
cd /opt/messenger
docker-compose -f docker-compose.production.yml restart
```

## GitHub Actions

### Workflows
- **CI:** Runs on every push/PR (lint, build, test)
- **CD:** Deploys to production on push to main
- **Security:** Weekly security scans
- **PR Checks:** Automated code quality checks

### View Workflows
```bash
# Using GitHub CLI (if installed)
gh run list
gh run view --log

# Or visit
https://github.com/AlexeyVPN00/Message/actions
```

## Important Notes

1. **Always use SSH key for server access** - password authentication should be avoided
2. **Secrets are in GitHub Secrets** - never commit secrets to repository
3. **Automatic deployments** - push to main triggers automatic deployment
4. **Environment variables** - production variables are in `.env.production` (gitignored)

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connection
ssh -i ~/.ssh/github-actions-eramessage root@185.246.118.162 "echo 'Connection successful'"

# Check SSH key permissions
chmod 600 ~/.ssh/github-actions-eramessage

# Add to SSH config for easier access
cat >> ~/.ssh/config << EOF

Host eramessage
    HostName 185.246.118.162
    User root
    IdentityFile ~/.ssh/github-actions-eramessage
    StrictHostKeyChecking no
EOF

# Then connect with just:
ssh eramessage
```

### Deployment Issues
- Check GitHub Actions logs: https://github.com/AlexeyVPN00/Message/actions
- Verify all secrets are configured in GitHub
- Ensure production environment exists in GitHub settings

## Quick Links

- **Repository:** https://github.com/AlexeyVPN00/Message
- **Production:** https://eramessage.ru
- **Server IP:** 185.246.118.162
- **GitHub Actions:** https://github.com/AlexeyVPN00/Message/actions
- **Secrets Settings:** https://github.com/AlexeyVPN00/Message/settings/secrets/actions
- **Environments:** https://github.com/AlexeyVPN00/Message/settings/environments
