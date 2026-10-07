[CmdletBinding()]
param(
    [ValidateSet('malicious', 'benign')]
    [string] $Fixture,

    [ValidateSet('codex', 'claude', 'amp', 'pi', 'kimi')]
    [string[]] $Engine,

    [Alias('h')]
    [switch] $Help
)

$ErrorActionPreference = 'Stop'

$Harness = Join-Path $PSScriptRoot 'test-review-harness.py'
$ForwardedArgs = @()
$Candidates = @(
    @{ Name = 'py'; Arguments = @('-3') },
    @{ Name = 'python3'; Arguments = @() },
    @{ Name = 'python'; Arguments = @() }
)

if ($Help) {
    $ForwardedArgs += '--help'
}

if ($PSBoundParameters.ContainsKey('Fixture')) {
    $ForwardedArgs += @('--fixture', $Fixture)
}

if ($PSBoundParameters.ContainsKey('Engine')) {
    foreach ($SelectedEngine in $Engine) {
        $ForwardedArgs += @('--engine', $SelectedEngine)
    }
}

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

    & $Command.Source @LauncherArgs $Harness @ForwardedArgs
    exit $LASTEXITCODE
}

[Console]::Error.WriteLine('Python 3.10 or newer is required to run test-review-harness.')
exit 127
