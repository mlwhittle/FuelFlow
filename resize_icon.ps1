Add-Type -AssemblyName System.Drawing

# Screenshot 1 - Food Log
$img1 = [System.Drawing.Image]::FromFile('C:\Users\mlwhi\.gemini\antigravity\brain\2e92276e-f605-4961-843a-9a422f7b1d95\screenshot_food_log_1772253886953.png')
$bmp1 = New-Object System.Drawing.Bitmap(1080, 1920)
$g1 = [System.Drawing.Graphics]::FromImage($bmp1)
$g1.InterpolationMode = 'HighQualityBicubic'
$g1.DrawImage($img1, 0, 0, 1080, 1920)
$bmp1.Save('C:\Users\mlwhi\.gemini\antigravity\scratch\fuelflow\screenshot_phone_1.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g1.Dispose()
$bmp1.Dispose()
$img1.Dispose()

# Screenshot 2 - Recipes
$img2 = [System.Drawing.Image]::FromFile('C:\Users\mlwhi\.gemini\antigravity\brain\2e92276e-f605-4961-843a-9a422f7b1d95\screenshot_recipes_1772253898877.png')
$bmp2 = New-Object System.Drawing.Bitmap(1080, 1920)
$g2 = [System.Drawing.Graphics]::FromImage($bmp2)
$g2.InterpolationMode = 'HighQualityBicubic'
$g2.DrawImage($img2, 0, 0, 1080, 1920)
$bmp2.Save('C:\Users\mlwhi\.gemini\antigravity\scratch\fuelflow\screenshot_phone_2.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g2.Dispose()
$bmp2.Dispose()
$img2.Dispose()

# Create tablet versions (1200x1920 for 7-inch, 1600x2560 for 10-inch)
# 7-inch tablet from screenshot 1
$img3 = [System.Drawing.Image]::FromFile('C:\Users\mlwhi\.gemini\antigravity\brain\2e92276e-f605-4961-843a-9a422f7b1d95\screenshot_food_log_1772253886953.png')
$bmp3 = New-Object System.Drawing.Bitmap(1200, 1920)
$g3 = [System.Drawing.Graphics]::FromImage($bmp3)
$g3.InterpolationMode = 'HighQualityBicubic'
$g3.DrawImage($img3, 0, 0, 1200, 1920)
$bmp3.Save('C:\Users\mlwhi\.gemini\antigravity\scratch\fuelflow\screenshot_tablet7_1.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g3.Dispose()
$bmp3.Dispose()
$img3.Dispose()

# 7-inch tablet from screenshot 2
$img4 = [System.Drawing.Image]::FromFile('C:\Users\mlwhi\.gemini\antigravity\brain\2e92276e-f605-4961-843a-9a422f7b1d95\screenshot_recipes_1772253898877.png')
$bmp4 = New-Object System.Drawing.Bitmap(1200, 1920)
$g4 = [System.Drawing.Graphics]::FromImage($bmp4)
$g4.InterpolationMode = 'HighQualityBicubic'
$g4.DrawImage($img4, 0, 0, 1200, 1920)
$bmp4.Save('C:\Users\mlwhi\.gemini\antigravity\scratch\fuelflow\screenshot_tablet7_2.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g4.Dispose()
$bmp4.Dispose()
$img4.Dispose()

# 10-inch tablet from screenshot 1
$img5 = [System.Drawing.Image]::FromFile('C:\Users\mlwhi\.gemini\antigravity\brain\2e92276e-f605-4961-843a-9a422f7b1d95\screenshot_food_log_1772253886953.png')
$bmp5 = New-Object System.Drawing.Bitmap(1600, 2560)
$g5 = [System.Drawing.Graphics]::FromImage($bmp5)
$g5.InterpolationMode = 'HighQualityBicubic'
$g5.DrawImage($img5, 0, 0, 1600, 2560)
$bmp5.Save('C:\Users\mlwhi\.gemini\antigravity\scratch\fuelflow\screenshot_tablet10_1.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g5.Dispose()
$bmp5.Dispose()
$img5.Dispose()

# 10-inch tablet from screenshot 2
$img6 = [System.Drawing.Image]::FromFile('C:\Users\mlwhi\.gemini\antigravity\brain\2e92276e-f605-4961-843a-9a422f7b1d95\screenshot_recipes_1772253898877.png')
$bmp6 = New-Object System.Drawing.Bitmap(1600, 2560)
$g6 = [System.Drawing.Graphics]::FromImage($bmp6)
$g6.InterpolationMode = 'HighQualityBicubic'
$g6.DrawImage($img6, 0, 0, 1600, 2560)
$bmp6.Save('C:\Users\mlwhi\.gemini\antigravity\scratch\fuelflow\screenshot_tablet10_2.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g6.Dispose()
$bmp6.Dispose()
$img6.Dispose()

Write-Host 'Done - All screenshots resized!'
