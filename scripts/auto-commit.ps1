param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Message
)

$Git = "C:\Users\ellis\AppData\Local\GitHubDesktop\app-3.6.2\resources\app\git\cmd\git.exe"

$env:GIT_TERMINAL_PROMPT = 0
$env:GCM_INTERACTIVE = "never"
$env:GCM_MODAL = "false"

Write-Host ">> Staging all changes..."
& $Git add -A
if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] git add failed"; exit 1 }

Write-Host ">> Committing: $Message"
& $Git commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Host "[FAIL] git commit failed (maybe nothing to commit?)"; exit 1 }

Write-Host ">> Pushing to origin/main..."
& $Git push origin main 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "[WARN] git push failed - you may need to push manually via GitHub Desktop"
  exit 1
}

Write-Host "[OK] Done - committed and pushed: $Message"
