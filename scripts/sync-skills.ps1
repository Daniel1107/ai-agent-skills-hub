param(
  [string[]]$Names,
  [int]$MaxCount = 0,
  [switch]$PendingOnly,
  [switch]$Refresh
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$skillsRegistry = Get-Content -LiteralPath (Join-Path $root 'registry\skills.json') -Raw | ConvertFrom-Json
$compatRegistry = Get-Content -LiteralPath (Join-Path $root 'registry\compatibility.json') -Raw | ConvertFrom-Json
$syncRegistry = Get-Content -LiteralPath (Join-Path $root 'registry\sync-state.json') -Raw | ConvertFrom-Json
$git = 'C:\Program Files\Git\cmd\git.exe'
$cacheRoot = Join-Path $root 'upstream-cache\bulk-sync'
$gitToken = $env:GITHUB_TOKEN
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (!(Test-Path -LiteralPath $cacheRoot)) {
  New-Item -ItemType Directory -Path $cacheRoot | Out-Null
}

function Get-RuntimeDir([string]$runtime) {
  switch ($runtime) {
    'claude-code' { return 'claude-code' }
    'shared' { return 'shared' }
    default { return 'codex' }
  }
}

function Get-RepoCacheKey([string]$repoUrl) {
  $sha1 = [System.Security.Cryptography.SHA1]::Create()
  $bytes = [Text.Encoding]::UTF8.GetBytes($repoUrl)
  $hash = [System.BitConverter]::ToString($sha1.ComputeHash($bytes)).Replace('-', '').ToLower().Substring(0, 10)
  $parts = $repoUrl.TrimEnd('/') -split '/'
  $leaf = (($parts[($parts.Length - 2)..($parts.Length - 1)]) -join '-').Replace('.git', '')
  return "$leaf-$hash"
}

function Write-SyncState {
  $syncRegistry.updatedAt = (Get-Date).ToString('s')
  $content = $syncRegistry | ConvertTo-Json -Depth 8
  [System.IO.File]::WriteAllText((Join-Path $root 'registry\sync-state.json'), $content, $utf8NoBom)
}

function Write-Report($rows) {
  $content = @(
    '# Sync Report',
    '',
    "Generated: $((Get-Date).ToString('s'))",
    '',
    '| Skill | Runtime | Sync Mode | Upstream Repo | Upstream Path | Status |',
    '|---|---|---|---|---|---|'
  ) + $rows + @('')
  [System.IO.File]::WriteAllText((Join-Path $root 'reports\sync-report.md'), ($content -join [Environment]::NewLine), $utf8NoBom)
}

$selectedSkills = @($skillsRegistry.skills | Where-Object {
  !$Names -or $Names.Count -eq 0 -or $_.name -in $Names
})

if ($PendingOnly) {
  $selectedSkills = @($selectedSkills | Where-Object {
    $skillName = $_.name
    $state = $syncRegistry.entries | Where-Object { $_.name -eq $skillName } | Select-Object -First 1
    $null -ne $state
  })
  $selectedSkills = @($selectedSkills | Where-Object {
    $skillName = $_.name
    $state = $syncRegistry.entries | Where-Object { $_.name -eq $skillName } | Select-Object -First 1
    $state.syncStatus -ne 'synced'
  })
}

if ($MaxCount -gt 0) {
  $selectedSkills = @($selectedSkills | Select-Object -First $MaxCount)
}

if ($selectedSkills.Count -eq 0) {
  throw 'No skills matched sync selector.'
}

$repoCache = @{}
$reportRows = New-Object System.Collections.Generic.List[string]

foreach ($skill in $selectedSkills) {
  $compat = $compatRegistry.entries | Where-Object { $_.name -eq $skill.name } | Select-Object -First 1
  $state = $syncRegistry.entries | Where-Object { $_.name -eq $skill.name } | Select-Object -First 1
  if ($null -eq $compat) { throw "Missing compatibility entry for $($skill.name)" }
  if ($null -eq $state) { throw "Missing sync-state entry for $($skill.name)" }

  $runtimeDir = Get-RuntimeDir $compat.runtime
  $target = Join-Path $root ("skills\$runtimeDir\" + $skill.slug)
  if (!(Test-Path -LiteralPath $target)) {
    New-Item -ItemType Directory -Path $target | Out-Null
  }

  try {
    Get-ChildItem -LiteralPath $target -Force -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -ne 'HUB.md' } |
      Remove-Item -Recurse -Force

    $commit = $null
    if ($skill.syncMode -eq 'remote-manifest') {
      $content = (Invoke-WebRequest -Uri $skill.upstreamRepo -UseBasicParsing).Content
      [System.IO.File]::WriteAllText((Join-Path $target 'SKILL.md'), $content, $utf8NoBom)
    } elseif ($skill.syncMode -eq 'local-path') {
      $sourceDir = $skill.upstreamRepo
      if (!(Test-Path -LiteralPath $sourceDir)) {
        throw "local source not found: $sourceDir"
      }
      Get-ChildItem -LiteralPath $sourceDir -Force |
        Where-Object { $_.Name -ne '.git' } |
        ForEach-Object {
          Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $target $_.Name) -Recurse -Force
        }
      $commit = 'local'
    } else {
      if (-not $repoCache.ContainsKey($skill.upstreamRepo)) {
        $repoKey = Get-RepoCacheKey $skill.upstreamRepo
        $repoDir = Join-Path $cacheRoot $repoKey
        if ((Test-Path -LiteralPath $repoDir) -and $Refresh) {
          Remove-Item -LiteralPath $repoDir -Recurse -Force
        }
        if (!(Test-Path -LiteralPath $repoDir)) {
          if ($gitToken) {
            $basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$gitToken"))
            & $git -c "http.https://github.com/.extraheader=AUTHORIZATION: Basic $basic" clone --depth 1 --branch $skill.defaultBranch $skill.upstreamRepo $repoDir | Out-Null
          } else {
            & $git clone --depth 1 --branch $skill.defaultBranch $skill.upstreamRepo $repoDir | Out-Null
          }
          if ($LASTEXITCODE -ne 0) {
            throw "git clone failed: $($skill.upstreamRepo)"
          }
        }
        $repoCache[$skill.upstreamRepo] = $repoDir
      }

      $repoDir = $repoCache[$skill.upstreamRepo]
      $commit = (& $git -C $repoDir rev-parse HEAD).Trim()
      if ($LASTEXITCODE -ne 0) {
        throw "git rev-parse failed: $($skill.upstreamRepo)"
      }

      if ($skill.syncMode -eq 'repo-root-skill') {
        $sourceDir = $repoDir
      } else {
        $sourceDir = Join-Path $repoDir $skill.upstreamPath
      }

      if (!(Test-Path -LiteralPath $sourceDir)) {
        throw "upstream path not found: $($skill.upstreamPath)"
      }

      Get-ChildItem -LiteralPath $sourceDir -Force |
        Where-Object { $_.Name -ne '.git' } |
        ForEach-Object {
          Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $target $_.Name) -Recurse -Force
        }
    }

    @{
      name = $skill.name
      runtime = $compat.runtime
      upstreamRepo = $skill.upstreamRepo
      upstreamPath = $skill.upstreamPath
      syncMode = $skill.syncMode
      syncedAt = (Get-Date).ToString('s')
      lastSyncedCommit = $commit
    } | ConvertTo-Json | ForEach-Object {
      [System.IO.File]::WriteAllText((Join-Path $target 'MIRROR.json'), $_, $utf8NoBom)
    }

    $state.syncStatus = 'synced'
    $state.lastSyncedAt = (Get-Date).ToString('s')
    $state.lastSyncedCommit = $commit
    $reportRows.Add("| $($skill.name) | $($compat.runtime) | $($skill.syncMode) | $($skill.upstreamRepo) | $($skill.upstreamPath) | synced |") | Out-Null
    Write-Output "[OK] $($skill.name)"
  } catch {
    $state.syncStatus = 'failed'
    $state.lastSyncedAt = (Get-Date).ToString('s')
    $reportRows.Add("| $($skill.name) | $($compat.runtime) | $($skill.syncMode) | $($skill.upstreamRepo) | $($skill.upstreamPath) | failed: $($_.Exception.Message) |") | Out-Null
    Write-Output "[FAIL] $($skill.name) :: $($_.Exception.Message)"
  }

  Write-SyncState
  Write-Report $reportRows
}
