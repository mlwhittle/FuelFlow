Add-Type -AssemblyName System.Drawing
$folder = 'C:\Users\mlwhi\.gemini\antigravity\brain\a6ea15d2-558f-453c-8bfe-6f8232bc051e'
$files = Get-ChildItem -Path $folder -Filter "app_store_*.png"
$targetWidth = 1284
$targetHeight = 2778

foreach ($file in $files) {
    if ($file.Name -like "UPLOAD_ME_*") { continue }
    
    $img = $null
    $bmp = $null
    $graph = $null
    
    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $bmp = New-Object System.Drawing.Bitmap $targetWidth, $targetHeight
        $graph = [System.Drawing.Graphics]::FromImage($bmp)
        
        # Apple prefers solid backgrounds (no alpha transparency) for screenshots
        $graph.Clear([System.Drawing.Color]::White)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.DrawImage($img, 0, 0, $targetWidth, $targetHeight)
        
        # Save as high-quality JPEG
        $outName = "UPLOAD_ME_" + $file.BaseName + ".jpg"
        $outPath = Join-Path $folder $outName
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        Write-Host "Upscaled to Retina 6.5`" ($targetWidth x $targetHeight): $outName"
    }
    finally {
        if ($graph) { $graph.Dispose() }
        if ($bmp) { $bmp.Dispose() }
        if ($img) { $img.Dispose() }
    }
}
