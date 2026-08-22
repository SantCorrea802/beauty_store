$ErrorActionPreference = "Stop"

$backendDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$envFile = Join-Path $backendDir ".env.local"

if (!(Test-Path $envFile)) {
    throw "No existe $envFile. Crea backend/.env.local antes de ejecutar el backend."
}

foreach ($rawLine in Get-Content $envFile) {
    $line = $rawLine.Trim()

    if ($line.Length -eq 0 -or $line.StartsWith("#")) {
        continue
    }

    $parts = $line -split "=", 2

    if ($parts.Length -ne 2) {
        throw "Línea inválida en .env.local: $rawLine"
    }

    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"')

    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

Push-Location $backendDir

try {
    .\mvnw.cmd spring-boot:run
}
finally {
    Pop-Location
}

