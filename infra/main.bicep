targetScope = 'subscription'

@description('Name of the dedicated resource group for the badminton application.')
param resourceGroupName string = 'rg-badminton-score-tracker-v2-prod'

@description('Azure region for the resource group and Static Web App.')
param location string = 'eastus2'

@description('Globally unique Azure Static Web App resource name.')
param staticWebAppName string = 'swa-badminton-score-tracker-v2-samiwell07'

@description('Subscription containing the existing public DNS zone.')
param dnsSubscriptionId string

@description('Resource group containing the existing public DNS zone.')
param dnsResourceGroupName string

@description('Existing public DNS zone. The zone itself is never modified or replaced.')
param dnsZoneName string

@description('Relative DNS label to create inside the existing zone.')
param dnsRecordName string = 'badminton'

@description('Tags applied only to newly created application resources.')
param tags object = {
  application: 'badminton-score-tracker-v2'
  environment: 'production'
  managedBy: 'bicep'
}

resource applicationResourceGroup 'Microsoft.Resources/resourceGroups@2024-11-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'static-web-app'
  scope: resourceGroup(applicationResourceGroup.name)
  params: {
    location: location
    name: staticWebAppName
    tags: tags
  }
}

module dnsRecord 'modules/dns-record.bicep' = {
  name: 'badminton-dns-record'
  scope: resourceGroup(dnsSubscriptionId, dnsResourceGroupName)
  params: {
    dnsZoneName: dnsZoneName
    recordName: dnsRecordName
    targetHostname: staticWebApp.outputs.defaultHostname
  }
}

module customDomain 'modules/custom-domain.bicep' = {
  name: 'static-web-app-custom-domain'
  scope: resourceGroup(applicationResourceGroup.name)
  dependsOn: [
    dnsRecord
  ]
  params: {
    customDomainName: '${dnsRecordName}.${dnsZoneName}'
    staticWebAppName: staticWebAppName
  }
}

output applicationResourceGroupName string = applicationResourceGroup.name
output staticWebAppName string = staticWebAppName
output defaultHostname string = staticWebApp.outputs.defaultHostname
output customDomainName string = customDomain.outputs.customDomainName
output siteUrl string = 'https://${customDomain.outputs.customDomainName}'