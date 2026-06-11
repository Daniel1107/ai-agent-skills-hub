param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("document-automation", "dev-engineering", "agent-collaboration", "specialized-media-context")]
  [string]$Category,
  [switch]$DryRun
)

$argsList = @("scripts/install-skills.mjs", "--category", $Category)
if ($DryRun) {
  $argsList += "--dry-run"
}

node @argsList
exit $LASTEXITCODE

