Param(
	[Parameter(Mandatory=$true)][string]$iisAppName,
	[Parameter(Mandatory=$true)][string]$envName,
	[Parameter(Mandatory=$true)][string]$envType,
	[Parameter(Mandatory=$false)][string]$envId,
	[Parameter(Mandatory=$true)][string]$portNumber
)
. "$env:ModulesPath\global_$envType$envId.ps1"

if($envType -eq "prod"){
	$siteUri = "http://$s3BucketDNS/web-sites/$iisAppName/index.html"
}
else{
	$siteUri = "http://$s3BucketDNS/$envName$envId/web-sites/$iisAppName/index.html"
}

Write-Output "Validating site $siteUri ..."
Invoke-WebRequest -Uri  $siteUri -UseBasicParsing
