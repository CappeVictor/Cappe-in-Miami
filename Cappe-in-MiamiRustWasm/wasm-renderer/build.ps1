$ErrorActionPreference = 'Stop'
$manifest = Join-Path $PSScriptRoot 'Cargo.toml'
$targetWasm = Join-Path $PSScriptRoot 'target\wasm32-unknown-unknown\release\cappe_renderer_wasm.wasm'
$package = Join-Path $PSScriptRoot 'pkg'

cargo build --manifest-path $manifest --release --target wasm32-unknown-unknown
New-Item -ItemType Directory -Force -Path $package | Out-Null
Copy-Item -LiteralPath $targetWasm -Destination (Join-Path $package 'renderer.wasm') -Force
Write-Output "Rust/WASM renderer bridge atualizado em $(Join-Path $package 'renderer.wasm')"
