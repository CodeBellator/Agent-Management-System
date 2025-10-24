# PowerShell script to test file upload
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@example.com","password":"password123"}'
$token = $loginResponse.token

Write-Host "Login successful, testing file upload..."

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"sample-data.csv`"",
    "Content-Type: text/csv$LF",
    (Get-Content "sample-data.csv" -Raw),
    "--$boundary--$LF"
) -join $LF

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/lists/upload" -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary" -Headers @{"Authorization"="Bearer $token"}
    Write-Host "Upload successful!"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "Upload failed: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}