$ErrorActionPreference = 'Continue'

$verifyOutput = & npm run verify 2>&1
$verifyExitCode = $LASTEXITCODE
$verifyOutput | ForEach-Object { [Console]::Error.WriteLine($_) }

if ($verifyExitCode -ne 0) {
  @{
    continue = $false
    stopReason = 'Automated app verification failed. Fix the reported test, lint, build, or browser error before completing the task.'
    systemMessage = 'The workspace Stop hook ran npm run verify and it failed.'
  } | ConvertTo-Json -Compress
  exit 2
}

@{
  continue = $true
  systemMessage = 'Automated app verification passed: tests, lint, build, and browser smoke checks.'
} | ConvertTo-Json -Compress