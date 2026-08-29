targetScope = 'resourceGroup'

param dnsZoneName string
param recordName string
param targetHostname string

resource dnsZone 'Microsoft.Network/dnsZones@2018-05-01' existing = {
  name: dnsZoneName
}

resource cnameRecord 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = {
  parent: dnsZone
  name: recordName
  properties: {
    TTL: 300
    CNAMERecord: {
      cname: targetHostname
    }
  }
}

output fqdn string = '${recordName}.${dnsZoneName}'
output targetHostname string = targetHostname