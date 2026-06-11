param(
  [switch]$DryRun
)

$argsList = @("scripts/install-skills.mjs", "--all")
if ($DryRun) {
  $argsList += "--dry-run"
}

node @argsList
exit $LASTEXITCODE

