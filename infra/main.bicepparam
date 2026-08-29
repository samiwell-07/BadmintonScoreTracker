using './main.bicep'

param resourceGroupName = 'rg-badminton-score-tracker-v2-prod'
param location = 'eastus2'
param staticWebAppName = 'swa-badminton-score-tracker-v2-samiwell07'
param dnsSubscriptionId = 'a06337ad-e909-48b6-b246-e03d1fa6ce03'
param dnsResourceGroupName = 'rg-leaguedispatcher-shared'
param dnsZoneName = 'srouji.org'
param dnsRecordName = 'badminton'