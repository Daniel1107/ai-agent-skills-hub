param(
  [ValidateSet("codex", "claude-code", "shared")]
  [string]$Runtime = "codex",
  [switch]$DryRun
)

$argsList = @("scripts/install-skills.mjs", "--runtime", $Runtime)
if ($DryRun) {
  $argsList += "--dry-run"
}

node @argsList
exit $LASTEXITCODE
