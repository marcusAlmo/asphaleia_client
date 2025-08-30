# List of HTML files to update
$files = @(
    'machines.html',
    'reports.html',
    'settings.html',
    'student-management.html',
    'teacher-management.html'
)

# Pattern to match the dashboard link
$pattern = '(?s)<li>\s*<a href="dashboard\.html"[^>]*>.*?<\/a>\s*<\/li>'
$replacement = '<!-- Dashboard link removed -->'

# Process each file
foreach ($file in $files) {
    $filePath = Join-Path -Path $PSScriptRoot -ChildPath $file
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $newContent = $content -replace $pattern, $replacement
        
        if ($content -ne $newContent) {
            $newContent | Set-Content -Path $filePath -Encoding UTF8 -NoNewline
            Write-Host "Updated: $file"
        } else {
            Write-Host "No changes needed for: $file"
        }
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "\nDashboard link removal complete."
