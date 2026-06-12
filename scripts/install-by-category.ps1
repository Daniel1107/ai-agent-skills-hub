param(
  [Parameter(Mandatory = $true)]
  [string]$Profile,
  [switch]$DryRun
)

$argsList = @("scripts/install-skills.mjs", "--profile", $Profile)
if ($DryRun) {
  $argsList += "--dry-run"
}

node @argsList
exit $LASTEXITCODE
