$ErrorActionPreference = 'Stop'

$Helper = Join-Path $PSScriptRoot 'autoreview'
$ForwardedArgs = $args
$Candidates = @(
    @{ Name = 'py'; Arguments = @('-3') },
    @{ Name = 'python3'; Arguments = @() },
    @{ Name = 'python'; Arguments = @() }
)

foreach ($Candidate in $Candidates) {
    $Command = Get-Command $Candidate.Name -CommandType Application -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($null -eq $Command) {
        continue
    }

    $LauncherArgs = $Candidate.Arguments
    try {
        & $Command.Source @LauncherArgs -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)' *> $null
    }
    catch {
        continue
    }
    if ($LASTEXITCODE -ne 0) {
        continue
    }

    & $Command.Source @LauncherArgs $Helper @ForwardedArgs
    exit $LASTEXITCODE
}

[Console]::Error.WriteLine('Python 3.10 or newer is required to run autoreview.')
exit 127
