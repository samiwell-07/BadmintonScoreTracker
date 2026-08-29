[CmdletBinding()]
param(
  [string]$SubscriptionId = 'a06337ad-e909-48b6-b246-e03d1fa6ce03',
  [string]$DeploymentLocation = 'eastus2',
  [string]$ResourceGroupName = 'rg-badminton-score-tracker-v2-prod',
  [string]$StaticWebAppName = 'swa-badminton-score-tracker-v2-samiwell07',
  [string]$DnsSubscriptionId = 'a06337ad-e909-48b6-b246-e03d1fa6ce03',
  [string]$DnsResourceGroupName = 'rg-leaguedispatcher-shared',
  [string]$DnsZoneName = 'srouji.org',
  [string]$DnsRecordName = 'badminton',
  [switch]$WhatIf
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-LastExitCode([string]$Action) {
  if ($LASTEXITCODE -ne 0) {
    throw "$Action failed with exit code $LASTEXITCODE."
  }
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$templateFile = Join-Path $repositoryRoot 'infra/main.bicep'
$customDomain = "$DnsRecordName.$DnsZoneName"
$deploymentName = "badminton-score-tracker-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host 'Selecting Azure subscription...'
& az account set --subscription $SubscriptionId
Assert-LastExitCode 'Selecting the Azure subscription'

Write-Host "Checking the shared DNS zone for $customDomain..."
$recordJson = & az network dns record-set list `
  --subscription $DnsSubscriptionId `
  --resource-group $DnsResourceGroupName `
  --zone-name $DnsZoneName `
  --output json
Assert-LastExitCode 'Reading DNS records'
$records = @($recordJson | ConvertFrom-Json)
$existingRecords = @($records | Where-Object { $_.name -eq $DnsRecordName })

if ($existingRecords.Count -gt 0) {
  $appJson = & az staticwebapp show `
    --subscription $SubscriptionId `
    --resource-group $ResourceGroupName `
    --name $StaticWebAppName `
    --output json 2>$null

  if ($LASTEXITCODE -ne 0) {
    throw "$customDomain already exists in DNS, but the expected Static Web App does not. No resources were changed."
  }

  $app = $appJson | ConvertFrom-Json
  $safeRecord = $existingRecords.Count -eq 1 `
    -and $existingRecords[0].type -eq 'Microsoft.Network/dnszones/CNAME' `
    -and $existingRecords[0].cnameRecord.cname -eq $app.defaultHostname

  if (-not $safeRecord) {
    throw "$customDomain already has a DNS record not owned by this deployment. No resources were changed."
  }
}

$deploymentArguments = @(
  'deployment', 'sub', $(if ($WhatIf) { 'what-if' } else { 'create' }),
  '--subscription', $SubscriptionId,
  '--name', $deploymentName,
  '--location', $DeploymentLocation,
  '--template-file', $templateFile,
  '--parameters',
  "resourceGroupName=$ResourceGroupName",
  "location=$DeploymentLocation",
  "staticWebAppName=$StaticWebAppName",
  "dnsSubscriptionId=$DnsSubscriptionId",
  "dnsResourceGroupName=$DnsResourceGroupName",
  "dnsZoneName=$DnsZoneName",
  "dnsRecordName=$DnsRecordName"
)

Write-Host $(if ($WhatIf) { 'Previewing Azure changes...' } else { 'Deploying Azure infrastructure...' })
& az @deploymentArguments
Assert-LastExitCode 'Azure infrastructure deployment'

if (-not $WhatIf) {
  $deploymentJson = & az deployment sub show `
    --subscription $SubscriptionId `
    --name $deploymentName `
    --output json
  Assert-LastExitCode 'Reading deployment outputs'
  $outputs = ($deploymentJson | ConvertFrom-Json).properties.outputs

  Write-Host ''
  Write-Host 'Infrastructure deployment complete.' -ForegroundColor Green
  Write-Host "Resource group: $($outputs.applicationResourceGroupName.value)"
  Write-Host "Static Web App: $($outputs.staticWebAppName.value)"
  Write-Host "Azure hostname: https://$($outputs.defaultHostname.value)"
  Write-Host "Custom domain: $($outputs.siteUrl.value)"
}