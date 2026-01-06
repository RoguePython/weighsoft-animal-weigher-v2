# Script to enable Windows Long Path Support
# This fixes the 260 character path limit issue on Windows
# 
# IMPORTANT: This script must be run as Administrator
#
# Usage:
#   1. Right-click PowerShell and select "Run as Administrator"
#   2. Navigate to this project directory
#   3. Run: .\enable-long-paths.ps1
#   4. Restart your computer

Write-Host "Enabling Windows Long Path Support..." -ForegroundColor Yellow
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

try {
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
    $regName = "LongPathsEnabled"
    
    # Check if the value already exists
    $existing = Get-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue
    
    if ($existing -and $existing.LongPathsEnabled -eq 1) {
        Write-Host "Long path support is already enabled!" -ForegroundColor Green
    } else {
        # Set the registry value
        New-ItemProperty -Path $regPath -Name $regName -Value 1 -PropertyType DWORD -Force | Out-Null
        Write-Host "Long path support has been enabled!" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: You must restart your computer for this change to take effect." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "After restarting, you should be able to build the Android app without path length issues." -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Failed to enable long path support: $_" -ForegroundColor Red
    exit 1
}


