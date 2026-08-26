@echo off
chcp 65001
echo 正在启动后端服务...
start backend\dist\start.exe

echo 正在启动前端...
cd frontend
npm run dev

pause