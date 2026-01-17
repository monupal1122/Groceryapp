Add-Type -AssemblyName System.Drawing
$sourceFile = "C:\Users\ACER\.gemini\antigravity\brain\309162a5-b5f8-45c7-b3ae-8c0503db7ed0\attractive_grocery_icon_1768650479667.png"
$resDir = "c:\Users\ACER\OneDrive\Desktop\Blinkit\android\app\src\main\res"

$sizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$DestinationPath,
        [int]$Width
    )
    $img = [System.Drawing.Image]::FromFile($SourcePath)
    $newImg = New-Object System.Drawing.Bitmap($Width, $Width)
    $g = [System.Drawing.Graphics]::FromImage($newImg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $Width, $Width)
    $newImg.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $newImg.Dispose()
    $img.Dispose()
}

foreach ($folder in $sizes.Keys) {
    $folderPath = Join-Path $resDir $folder
    $destPath = Join-Path $folderPath "ic_launcher.png"
    $destPathRound = Join-Path $folderPath "ic_launcher_round.png"
    
    $width = $sizes[$folder]
    Write-Host "Resizing to $width x $width ($folder)..."
    Resize-Image -SourcePath $sourceFile -DestinationPath $destPath -Width $width
    Resize-Image -SourcePath $sourceFile -DestinationPath $destPathRound -Width $width
}

Write-Host "Icons updated successfully!"
