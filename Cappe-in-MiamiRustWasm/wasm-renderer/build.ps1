$ErrorActionPreference = 'Stop'
$package = Join-Path $PSScriptRoot 'pkg'
$directManifest = Join-Path $PSScriptRoot '..\wasm-renderer-direct\Cargo.toml'
$directTargetWasm = Join-Path $PSScriptRoot '..\wasm-renderer-direct\target\wasm32-unknown-unknown\release\cappe_renderer_direct.wasm'
$directOut = Join-Path $package 'direct'

if (-not (Get-Command wasm-bindgen -ErrorAction SilentlyContinue)) { throw 'wasm-bindgen CLI 0.2.129 é necessário para montar o módulo de chamadas Canvas diretas.' }
$wasmBindgenVersion = wasm-bindgen --version
if ($LASTEXITCODE -ne 0 -or $wasmBindgenVersion.Trim() -ne 'wasm-bindgen 0.2.129') { throw "Versão incompatível de wasm-bindgen: $wasmBindgenVersion (esperado 0.2.129)." }
cargo build --manifest-path $directManifest --release --target wasm32-unknown-unknown
if ($LASTEXITCODE -ne 0) { throw "direct renderer cargo build failed with exit code $LASTEXITCODE" }
New-Item -ItemType Directory -Force -Path $directOut | Out-Null
wasm-bindgen $directTargetWasm --target web --out-dir $directOut --out-name direct_renderer
if ($LASTEXITCODE -ne 0) { throw "wasm-bindgen failed with exit code $LASTEXITCODE" }
Write-Output "Renderer Rust/WebSys direto atualizado em $directOut"
