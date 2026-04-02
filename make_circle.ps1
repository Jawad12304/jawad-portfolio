Add-Type -AssemblyName System.Drawing

function Convert-ToCircle {
    param([string]$in, [string]$out)
    Write-Host "Processing $in -> $out"
    try {
        $img = [System.Drawing.Image]::FromFile($in)
        $size = [math]::Min($img.Width, $img.Height)
        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.Clear([System.Drawing.Color]::Transparent)
        
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
        $path.AddEllipse($rect)
        $g.SetClip($path)
        
        $x = ($size - $img.Width) / 2
        $y = ($size - $img.Height) / 2
        $g.DrawImage($img, $x, $y, $img.Width, $img.Height)
        
        $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Host "Success"
        
        $g.Dispose()
        $bmp.Dispose()
        $img.Dispose()
        $path.Dispose()
    } catch {
        Write-Host "Error: $_"
    }
}

$dir = "c:\Users\Jawad\Desktop\JAWAD PORTFOLIO WEBSITE\images"
Convert-ToCircle "$dir\favicon.png" "$dir\favicon-circle.png"
Convert-ToCircle "$dir\favicon-light.png" "$dir\favicon-light-circle.png"
Convert-ToCircle "$dir\favicon-dark.png" "$dir\favicon-dark-circle.png"
