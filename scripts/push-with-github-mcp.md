# Push Fake-CRT-Terminal with GitHub MCP

This guide uses the GitHub MCP Server (`@modelcontextprotocol/server-github`) so your AI client can fork and push files without storing tokens in your repo.

## 1) Prepare a GitHub Personal Access Token

Create a PAT with `repo` (or `public_repo`) scope:
- https://github.com/settings/tokens (Fine-grained tokens are OK; allow access to the target org/account.)

Export it in your shell:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_...
```

## 2) Start the GitHub MCP server

Option A — use the wrapper script (from repo root):

```bash
./scripts/run-github-mcp.sh
```

Option B — call with `npx` directly:

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN npx -y @modelcontextprotocol/server-github
```

Your MCP client (e.g., Claude Desktop) should be configured to spawn this server. Example client config:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_GITHUB_PAT>" }
    }
  }
}
```

## 3) Fork the upstream repo

Use the `fork_repository` tool:

- owner: `davislcruz`
- repo: `Fake-CRT-Terminal`

The server returns your fork details (e.g., `your-username/Fake-CRT-Terminal`).

## 4) Push local files with `push_files`

From your local checkout, enumerate files to upload (excluding ignored paths). Example to generate a JSON payload:

```bash
cd Fake-CRT-Terminal
git ls-files \
  | grep -vE '^(img/family/|\\.server/|.*\\.log|server\\.pid$)' \
  | xargs -I{} bash -lc 'printf "{\"path\":\"%s\",\"content\":%s}\n" "{}" "$(jq -Rs . < \"{}\")"' \
  | jq -s '{files: ., branch: "main", message: "chore: initial import via MCP"}' \
  > ../mcp_push_payload.json
```

Then call `push_files` in your MCP client with:

- owner: `<your-username>`
- repo: `Fake-CRT-Terminal`
- branch: `main` (it will be created if missing)
- files: contents of `../mcp_push_payload.json` → `files`
- message: commit message

That will create the branch and commit your files to your fork.

## Notes

- Keep your PAT only in environment variables; do not commit it.
- The repo contains `.gitignore` and `.vercelignore` to prevent leaking local logs or personal images.
```
