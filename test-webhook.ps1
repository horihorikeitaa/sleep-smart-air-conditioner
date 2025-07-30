$body = @{
    eventType    = "changeReport"
    eventVersion = "1"
    context      = @{
        deviceType   = "WoHub2"
        deviceMac    = "AA:BB:CC:DD:EE:FF"
        temperature  = 25.5
        humidity     = 60
        lightLevel   = 15
        scale        = "CELSIUS"
        timeOfSample = 1640995200
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "https://lhxc14v2c7.execute-api.ap-northeast-1.amazonaws.com/dev/webhook/switchbot" -Method POST -Headers @{"Content-Type" = "application/json" } -Body $body
    Write-Host "SUCCESS:"
    $response | ConvertTo-Json -Depth 3
}
catch {
    Write-Host "ERROR:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body:" $errorBody
    }
}