$log = "E:\Dev\Github Repos\NetflixClone\.freebuff\preview-15e8f4a9-c867-4ce6-8c6b-1044eccf8e8d.log"
$logErr = "E:\Dev\Github Repos\NetflixClone\.freebuff\preview-15e8f4a9-c867-4ce6-8c6b-1044eccf8e8d.log.err"
$proc = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -WorkingDirectory 'E:\Dev\Github Repos\NetflixClone' -RedirectStandardOutput $log -RedirectStandardError $logErr -WindowStyle Hidden -PassThru
Write-Host $proc.Id
