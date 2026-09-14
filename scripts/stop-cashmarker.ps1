param([switch]$Quiet)

$ErrorActionPreference = "Stop"

$projectPath = Split-Path -Parent $PSScriptRoot
$runtimePath = Join-Path $projectPath ".runtime"
$processRecordPath = Join-Path $runtimePath "dev-server.json"

function Show-LauncherMessage {
  param(
    [string]$Message,
    [bool]$IsError = $false
  )

  if ($Quiet) {
    Write-Output $Message
    return
  }

  Add-Type -AssemblyName PresentationFramework
  $icon = if ($IsError) {
    [System.Windows.MessageBoxImage]::Error
  }
  else {
    [System.Windows.MessageBoxImage]::Information
  }

  [System.Windows.MessageBox]::Show(
    $Message,
    "CashMarker",
    [System.Windows.MessageBoxButton]::OK,
    $icon
  ) | Out-Null
}

try {
  if (-not (Test-Path -LiteralPath $processRecordPath)) {
    Show-LauncherMessage "CashMarker has no recorded background server."
    exit 0
  }

  $processRecord = Get-Content -LiteralPath $processRecordPath -Raw | ConvertFrom-Json
  $runningProcesses = @()

  foreach ($savedProcess in @($processRecord.processes)) {
    $savedPid = [int]$savedProcess.processId
    $expectedStartTime = [DateTime]::Parse($savedProcess.startedAtUtc).ToUniversalTime()
    $runningProcess = Get-Process -Id $savedPid -ErrorAction SilentlyContinue

    if (-not $runningProcess) {
      continue
    }

    $actualStartTime = $runningProcess.StartTime.ToUniversalTime()
    $startTimeDifference = [Math]::Abs(($actualStartTime - $expectedStartTime).TotalSeconds)
    if ($runningProcess.ProcessName -ne "node" -or $startTimeDifference -gt 1) {
      Remove-Item -LiteralPath $processRecordPath -Force
      throw "The saved server record no longer matches the running process. Nothing was stopped."
    }

    $runningProcesses += $runningProcess
  }

  if ($runningProcesses.Count -eq 0) {
    Remove-Item -LiteralPath $processRecordPath -Force
    Show-LauncherMessage "CashMarker is already stopped."
    exit 0
  }

  Stop-Process -Id $runningProcesses.Id -Force
  Remove-Item -LiteralPath $processRecordPath -Force -ErrorAction SilentlyContinue
  Show-LauncherMessage "CashMarker has been stopped."
}
catch {
  Show-LauncherMessage $_.Exception.Message $true
  exit 1
}
