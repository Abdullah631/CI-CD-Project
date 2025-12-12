# PowerShell script to generate self-signed SSL certificate for local development

Write-Host "Generating self-signed SSL certificate for HTTPS..." -ForegroundColor Green

# Create cert directory if it doesn't exist
$certDir = ".\cert"
if (!(Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
}

# Generate self-signed certificate using OpenSSL (if available) or New-SelfSignedCertificate
$opensslPath = Get-Command openssl -ErrorAction SilentlyContinue

if ($opensslPath) {
    Write-Host "Using OpenSSL to generate certificate..." -ForegroundColor Cyan
    
    # Generate private key
    & openssl genrsa -out "$certDir\key.pem" 2048
    
    # Generate certificate
    & openssl req -new -x509 -key "$certDir\key.pem" -out "$certDir\cert.pem" -days 365 -subj "/CN=192.168.100.12"
    
    Write-Host "`nCertificate generated successfully!" -ForegroundColor Green
} else {
    Write-Host "OpenSSL not found. Using PowerShell New-SelfSignedCertificate..." -ForegroundColor Cyan
    
    # Create certificate using PowerShell (Windows)
    $cert = New-SelfSignedCertificate -DnsName "192.168.100.12", "localhost" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)
    
    # Export certificate
    $certPath = "Cert:\CurrentUser\My\$($cert.Thumbprint)"
    $password = ConvertTo-SecureString -String "dev" -Force -AsPlainText
    
    Export-PfxCertificate -Cert $certPath -FilePath "$certDir\cert.pfx" -Password $password | Out-Null
    
    # Convert PFX to PEM format (requires OpenSSL, otherwise manual conversion needed)
    Write-Host "`nCertificate created at: $certDir\cert.pfx" -ForegroundColor Yellow
    Write-Host "To use with Vite, you need to convert to PEM format." -ForegroundColor Yellow
    Write-Host "Install OpenSSL and run:" -ForegroundColor Yellow
    Write-Host "  openssl pkcs12 -in cert\cert.pfx -out cert\cert.pem -nodes -passin pass:dev" -ForegroundColor White
    Write-Host "  openssl pkcs12 -in cert\cert.pfx -nocerts -out cert\key.pem -nodes -passin pass:dev" -ForegroundColor White
}

Write-Host "`nNext steps:" -ForegroundColor Green
Write-Host "1. Run: npm run dev -- --host" -ForegroundColor White
Write-Host "2. Access from laptop 1: https://localhost:5173" -ForegroundColor White
Write-Host "3. Access from laptop 2: https://192.168.100.12:5173" -ForegroundColor White
Write-Host "4. Accept the security warning in your browser (self-signed cert)" -ForegroundColor Yellow
Write-Host "`nNote: You'll need to accept the certificate warning in both browsers." -ForegroundColor Cyan
