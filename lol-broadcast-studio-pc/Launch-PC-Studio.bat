@echo off
title LoL Broadcast Studio PC - Apple Liquid Glass Desktop App
cd /d "E:\esports_broadcast_research\lol-broadcast-studio-pc"
if not exist "node_modules\ws" (
  echo [INFO] Installing dependencies...
  call npm install --no-audit --no-fund
)
if not exist "node_modules\electron\dist\electron.exe" (
  echo [INFO] Preparing Electron Desktop Runtime...
  call node node_modules\electron\install.js
)
echo [PASS] Launching LoL Broadcast Studio PC Native Window...
start "" "node_modules\electron\dist\electron.exe" "."
