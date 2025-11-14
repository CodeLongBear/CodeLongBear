@echo off
chcp 65001 >nul
echo ========================================
echo 启动 CodeBear 项目系统
echo ========================================
echo.

echo [1/2] 启动个人主页项目 (端口 8080)...
start "个人主页-8080" cmd /k "cd /d %~dp0CodeBearTest01 && echo 个人主页项目启动中... && mvn spring-boot:run"

timeout /t 3 /nobreak >nul

echo [2/2] 启动博客系统项目 (端口 8081)...
start "博客系统-8081" cmd /k "cd /d %~dp0CodeBearBlog && echo 博客系统项目启动中... && mvn spring-boot:run"

echo.
echo ========================================
echo 两个项目正在启动中，请稍候...
echo.
echo 个人主页: http://localhost:8080
echo 博客系统: http://localhost:8081
echo.
echo 提示：等待看到 "Started ... in X seconds" 表示启动成功
echo ========================================
echo.
pause

