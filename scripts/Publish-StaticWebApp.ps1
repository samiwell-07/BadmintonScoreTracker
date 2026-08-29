[CmdletBinding()]
param(
  [string]$SubscriptionId = 'a06337ad-e909-48b6-b246-e03d1fa6ce03',
  [string]$ResourceGroupName = 'rg-badminton-score-tracker-v2-prod',
  [string]$StaticWebAppName = 'swa-badminton-score-tracker-v2-samiwell07',
  [switch]$InstallDependencies,
  [switch]$SkipTests
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-LastExitCode([string]$Action) {
  if ($LASTEXITCODE -ne 0) {
    throw "$Action failed with exit code $LASTEXITCODE."
  }
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repositoryRoot

try {
  Write-Host 'Selecting Azure subscription...'
  & az account set --subscription $SubscriptionId
  Assert-LastExitCode 'Selecting the Azure subscription'

  if ($InstallDependencies) {
    Write-Host 'Installing locked npm dependencies...'
    & npm ci
    Assert-LastExitCode 'Installing npm dependencies'
  }

  $swaCli = Join-Path $repositoryRoot 'node_modules/.bin/swa.cmd'
  if (-not (Test-Path -LiteralPath $swaCli)) {
    throw 'Static Web Apps CLI is not installed. Stop any running dev server, run npm ci once, then retry publishing.'
  }

  if (-not $SkipTests) {
    Write-Host 'Running tests...'
    & npm test
    Assert-LastExitCode 'Running tests'
  }

  Write-Host 'Building production content...'
  & npm run build
  Assert-LastExitCode 'Building production content'

  Write-Host 'Retrieving the Static Web App deployment token...'
  $deploymentToken = & az staticwebapp secrets list `
    --subscription $SubscriptionId `
    --resource-group $ResourceGroupName `
    --name $StaticWebAppName `
    --query properties.apiKey `
    --output tsv
  Assert-LastExitCode 'Retrieving the deployment token'

  if ([string]::IsNullOrWhiteSpace($deploymentToken)) {
    throw 'Azure returned an empty Static Web App deployment token.'
  }

  $env:SWA_CLI_DEPLOYMENT_TOKEN = $deploymentToken
  Write-Host 'Publishing dist/ to the production environment...'
  & $swaCli deploy ./dist --env production
  Assert-LastExitCode 'Publishing Static Web App content'

  $defaultHostname = & az staticwebapp show `
    --subscription $SubscriptionId `
    --resource-group $ResourceGroupName `
    --name $StaticWebAppName `
    --query defaultHostname `
    --output tsv
  Assert-LastExitCode 'Reading the Static Web App hostname'

  Write-Host ''
  Write-Host 'Publish complete.' -ForegroundColor Green
  Write-Host "Azure URL: https://$defaultHostname"
  Write-Host 'Custom URL: https://badminton.srouji.org'
}
finally {
  Remove-Item Env:SWA_CLI_DEPLOYMENT_TOKEN -ErrorAction SilentlyContinue
  $deploymentToken = $null
  Pop-Location
}