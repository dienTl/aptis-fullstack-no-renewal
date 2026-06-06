param(
  [string]$BackendUrl = "http://localhost:8080",
  [string]$FrontendUrl = "http://localhost:5173"
)

$ErrorActionPreference = "Stop"

$ProjectCloudflared = Join-Path $PSScriptRoot "..\tools\cloudflared.exe"
$Cloudflared = if (Test-Path $ProjectCloudflared) {
  Resolve-Path $ProjectCloudflared
} else {
  (Get-Command cloudflared -ErrorAction SilentlyContinue)?.Source
}

if (-not $Cloudflared) {
  Write-Host "cloudflared is not installed. Install it first, then run this script again." -ForegroundColor Red
  Write-Host "Windows install: winget install --id Cloudflare.cloudflared" -ForegroundColor Yellow
  exit 1
}

Write-Host "Starting public tunnel for backend: $BackendUrl" -ForegroundColor Cyan
Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoExit", "-Command", "`"$Cloudflared`" tunnel --url $BackendUrl"

Write-Host "Starting public tunnel for frontend: $FrontendUrl" -ForegroundColor Cyan
Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoExit", "-Command", "`"$Cloudflared`" tunnel --url $FrontendUrl"

Write-Host ""
Write-Host "Copy the backend trycloudflare.com URL into SePay webhook:" -ForegroundColor Green
Write-Host "  https://<backend-tunnel>.trycloudflare.com/api/webhooks/bank"
Write-Host ""
Write-Host "Set frontend/.env.local like this if you want the frontend tunnel to call the backend tunnel:" -ForegroundColor Green
Write-Host "  VITE_API_URL=https://<backend-tunnel>.trycloudflare.com/api"
Write-Host ""
Write-Host "Set backend env APP_CORS to allow both local and public frontend origins:" -ForegroundColor Green
Write-Host "  APP_CORS=http://localhost:5173,https://<frontend-tunnel>.trycloudflare.com"
