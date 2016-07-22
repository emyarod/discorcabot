@echo off
where node.exe >nul 2>&1 && goto node || goto missingnode

:node
echo Node.js is installed
call gulp webpack
node discorcabot.js
goto end

:missingnode
echo Node.js is either not installed or not in your PATH!

:end
pause >nul