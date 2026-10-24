#!/usr/bin/env bash
# QAXALE AI — Automated GitHub Push Script
# Author: Hamza Yasin / ORONID TECH
# Target: https://github.com/amoozaraya-stack/QAXALE-AI.git

set -e

REPO_URL="https://github.com/amoozaraya-stack/QAXALE-AI.git"
TOKEN="$1"

if [ -z "$TOKEN" ]; then
  read -s -p "Enter your GitHub Personal Access Token (PAT): " TOKEN
  echo ""
fi

if [ -z "$TOKEN" ]; then
  echo "Error: GitHub Personal Access Token is required to authenticate with GitHub."
  exit 1
fi

echo "[ORONID TECH] Configuring git remote with authentication..."
AUTH_URL="https://${TOKEN}@github.com/amoozaraya-stack/QAXALE-AI.git"

git branch -M main
git push -u "$AUTH_URL" main

echo "[ORONID TECH] Success! Latest QAXALE codebase pushed to https://github.com/amoozaraya-stack/QAXALE-AI"
