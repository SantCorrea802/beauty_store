$ErrorActionPreference = "Stop"

$backendDir = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $backendDir ".env.local"

if (-not (Test-Path $envFile)) {
    throw "No existe .env.local en $backendDir"
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()

    if ($line -eq "" -or $line.StartsWith("#")) {
        return
    }

    $parts = $line -split "=", 2

    if ($parts.Length -ne 2) {
        return
    }

    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

Push-Location $backendDir
try {
    .\mvnw.cmd clean test
}
finally {
    Pop-Location
}