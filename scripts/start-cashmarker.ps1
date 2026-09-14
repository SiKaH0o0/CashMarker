param(
  [switch]$NoBrowser,
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"

$projectPath = Split-Path -Parent $PSScriptRoot
$runtimePath = Join-Path $projectPath ".runtime"
$processRecordPath = Join-Path $runtimePath "dev-server.json"
$stdoutPath = Join-Path $runtimePath "dev-server.out.log"
$stderrPath = Join-Path $runtimePath "dev-server.err.log"
$nextCliPath = Join-Path $projectPath "node_modules\next\dist\bin\next"
$nextCliArgument = "node_modules\next\dist\bin\next"
$siteUrl = "http://127.0.0.1:3000/today"

function Show-LauncherError {
  param([string]$Message)

  if ($Quiet) {
    Write-Error $Message
    return
  }

  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show(
    $Message,
    "CashMarker",
    [System.Windows.MessageBoxButton]::OK,
    [System.Windows.MessageBoxImage]::Error
  ) | Out-Null
}

function Test-SiteReady {
  try {
    $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 1
    return $response.StatusCode -ge 200 -and
      $response.StatusCode -lt 500 -and
      $response.Content.Contains("CashMarker")
  }
  catch {
    return $false
  }
}

function Open-CashMarker {
  if (-not $NoBrowser) {
    Start-Process $siteUrl
  }
}

function Get-ListeningProcessId {
  $netstatOutput = & netstat.exe -ano -p TCP
  foreach ($line in $netstatOutput) {
    if ($line -match "^\s*TCP\s+127\.0\.0\.1:3000\s+\S+\s+LISTENING\s+(\d+)\s*$") {
      return [int]$Matches[1]
    }
  }

  return $null
}

function New-ProcessRecord {
  param([System.Diagnostics.Process]$ServerProcess)

  $recordedProcesses = @(
    @{
      processId = $ServerProcess.Id
      startedAtUtc = $ServerProcess.StartTime.ToUniversalTime().ToString("O")
    }
  )

  $listenerPid = Get-ListeningProcessId
  if ($listenerPid -and $listenerPid -ne $ServerProcess.Id) {
    $listenerProcess = Get-Process -Id $listenerPid -ErrorAction SilentlyContinue
    if ($listenerProcess -and $listenerProcess.ProcessName -eq "node") {
      $recordedProcesses += @{
        processId = $listenerProcess.Id
        startedAtUtc = $listenerProcess.StartTime.ToUniversalTime().ToString("O")
      }
    }
  }

  @{
    processes = $recordedProcesses
  } |
    ConvertTo-Json -Depth 3 |
    Set-Content -LiteralPath $processRecordPath -Encoding utf8
}

function Find-NodeExecutable {
  $nodeCommand = Get-Command "node.exe" -ErrorAction SilentlyContinue
  if ($nodeCommand) {
    return $nodeCommand.Source
  }

  $codexRuntimeRoot = Join-Path $env:USERPROFILE ".cache\codex-runtimes"
  if (Test-Path -LiteralPath $codexRuntimeRoot) {
    $candidate = Get-ChildItem -LiteralPath $codexRuntimeRoot -Filter "node.exe" -File -Recurse -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -match "\\dependencies\\node\\bin\\node\.exe$" } |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1

    if ($candidate) {
      return $candidate.FullName
    }
  }

  return $null
}

try {
  if (Test-SiteReady) {
    Open-CashMarker
    exit 0
  }

  if (-not (Test-Path -LiteralPath $nextCliPath)) {
    throw "Project dependencies are missing. Ask Codex to restore the CashMarker dependencies."
  }

  $nodePath = Find-NodeExecutable
  if (-not $nodePath) {
    throw "Node.js was not found. Ask Codex to repair the CashMarker launcher."
  }

  New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null

  $serverProcess = Start-Process `
    -FilePath $nodePath `
    -ArgumentList @($nextCliArgument, "dev", "--hostname", "127.0.0.1", "--port", "3000") `
    -WorkingDirectory $projectPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -PassThru

  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    if (Test-SiteReady) {
      New-ProcessRecord $serverProcess
      Open-CashMarker
      exit 0
    }

    if ($serverProcess.HasExited) {
      $details = if (Test-Path -LiteralPath $stderrPath) {
        (Get-Content -LiteralPath $stderrPath -Tail 12) -join [Environment]::NewLine
      }
      else {
        "No error log was created."
      }

      throw "CashMarker stopped before it was ready.`n`n$details"
    }

    Start-Sleep -Milliseconds 500
  }

  throw "CashMarker did not become ready within 30 seconds. Check .runtime\dev-server.err.log."
}
catch {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
  }
  Show-LauncherError $_.Exception.Message
  exit 1
}
