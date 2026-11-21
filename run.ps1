$ErrorActionPreference = 'Stop'
$Port = 5500
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

# Inicia o site com as classes .NET que já acompanham o Windows PowerShell.
# Não é necessário instalar Python, Node.js, npm ou qualquer pacote adicional.
$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.htm'  = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.mjs'  = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.webp' = 'image/webp'
    '.ico'  = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
try {
    $listener.Start()
} catch {
    Write-Host "Could not start the server on port $Port. Is another server already using it?" -ForegroundColor Red
    throw
}

Write-Host "ReadQuest is running at http://localhost:$Port" -ForegroundColor Cyan
Write-Host "This server uses Windows PowerShell/.NET; Python is not required." -ForegroundColor Green
Write-Host "Keep this window open. Press Ctrl+C to stop the server." -ForegroundColor DarkGray

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $reader = $null
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }

            $parts = $requestLine.Split(' ')
            $method = $parts[0]
            $requestPath = if ($parts.Length -gt 1) { $parts[1] } else { '/' }
            while ($true) {
                $headerLine = $reader.ReadLine()
                if ($null -eq $headerLine -or $headerLine.Length -eq 0) { break }
            }

            $urlPath = [System.Uri]::UnescapeDataString(($requestPath -split '\?', 2)[0])
            if ($urlPath -eq '/') { $urlPath = '/index.html' }
            $relativePath = $urlPath.TrimStart('/') -replace '/', [System.IO.Path]::DirectorySeparatorChar
            $rootFullPath = [System.IO.Path]::GetFullPath($ProjectRoot)
            $fullPath = [System.IO.Path]::GetFullPath((Join-Path $rootFullPath $relativePath))
            $rootPrefix = $rootFullPath.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
            $safePath = $fullPath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)

            $status = '200 OK'
            $extension = ''
            $body = [byte[]]@()
            $contentType = 'application/octet-stream'
            if ($method -ne 'GET' -and $method -ne 'HEAD') {
                $status = '405 Method Not Allowed'
                $body = [System.Text.Encoding]::UTF8.GetBytes('Method Not Allowed')
                $contentType = 'text/plain; charset=utf-8'
            } elseif (-not $safePath -or -not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
                $status = '404 Not Found'
                $body = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
                $contentType = 'text/plain; charset=utf-8'
            } else {
                $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
                if ($mimeTypes.ContainsKey($extension)) { $contentType = $mimeTypes[$extension] }
                $body = [System.IO.File]::ReadAllBytes($fullPath)
            }

            $bodyLength = $body.Length
            $cacheControl = 'no-cache'
            if ($status -eq '200 OK' -and $extension -ne '.html') { $cacheControl = 'public, max-age=3600' }
            $responseHeader = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $bodyLength`r`nCache-Control: $cacheControl`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($responseHeader)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($method -ne 'HEAD' -and $bodyLength -gt 0) { $stream.Write($body, 0, $bodyLength) }
            $stream.Flush()
        } catch {
            Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor Red
        } finally {
            if ($reader) { $reader.Dispose() }
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
