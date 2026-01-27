$path = "app/barista/page.tsx"
$lines = Get-Content $path
$newLines = $lines[0..22] + "    // Use a simple beep from a reliable source." + "    const dingSound = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'" + $lines[38..($lines.Count-1)]
$newLines | Set-Content $path -Encoding UTF8
