Add-Type -AssemblyName System.Drawing
$folder = 'C:\Users\mlwhi\.gemini\antigravity\brain\a6ea15d2-558f-453c-8bfe-6f8232bc051e'
$files = Get-ChildItem -Path $folder -Filter "app_store_*.png"
$targetWidth = 2048
$targetHeight = 2732

foreach ($file in $files) {
    if ($file.Name -like "UPLOAD_ME_*") { continue }
    if ($file.Name -like "IPAD_UPLOAD_*") { continue }
    
    $img = $null
    $bmp = $null
    $graph = $null
    
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $bmp = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
        $graph = [System.Drawing.Graphics]::FromImage($bmp)
        
        $graph.Clear([System.Drawing.Color]::White)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        
        $ratio = [Math]::Min($targetWidth / $img.Width, $targetHeight / $img.Height)
        $newW = [int]($img.Width * $ratio)
        $newH = [int]($img.Height * $ratio)
        $posX = [int](($targetWidth - $newW) / 2)
        $posY = [int](($targetHeight - $newH) / 2)
        
        $graph.DrawImage($img, $posX, $posY, $newW, $newH)
        
        $outName = "IPAD_UPLOAD_" + $file.BaseName + ".jpg"
        $outPath = Join-Path $folder $outName
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        Write-Host "Upscaled and padded to iPad 12.9`: $outName"
    }
    finally {
        if ($graph) { $graph.Dispose() }
        if ($bmp) { $bmp.Dispose() }
        if ($img) { $img.Dispose() }
    }
}
