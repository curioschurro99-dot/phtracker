param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Message
)

$Git = "C:\Users\ellis\AppData\Local\GitHubDesktop\app-3.6.2\resources\app\git\cmd\git.exe"

Write-Host "→ Staging all changes..."
& $Git add -A
if ($LASTEXITCODE -ne 0) { Write-Host "✖ git add failed"; exit 1 }

Write-Host "→ Committing: $Message"
& $Git commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Host "✖ git commit failed (maybe nothing to commit?)"; exit 1 }

Write-Host "→ Pushing to origin/main..."
& $Git push origin main
if ($LASTEXITCODE -ne 0) { Write-Host "✖ git push failed"; exit 1 }

Write-Host "✓ Done — committed and pushed: $Message"
