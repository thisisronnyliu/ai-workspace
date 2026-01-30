#!/bin/bash
# GitHub 仓库设置脚本

# 注意：运行此脚本前，请确保：
# 1. 已安装 GitHub CLI (gh) - 可通过 `gh --version` 检查
# 2. 已通过 `gh auth login` 登录

echo "正在创建 GitHub 仓库..."

# 创建公共仓库
gh repo create jiujiu-todo-list --public --description "A beautiful and functional todo list application with modern UI design" --clone

if [ $? -eq 0 ]; then
    echo "仓库创建成功！"
    
    # 进入仓库目录
    cd jiujiu-todo-list
    
    # 如果是从现有代码库运行此脚本，复制文件
    # (在此处添加复制命令，如果是从模板创建)
    
    # 添加所有文件
    git add .
    
    # 提交更改
    git commit -m "Initial commit: Minimal Todo List App"
    
    # 推送到远程仓库
    git push -u origin main
    
    echo "代码已成功推送到 GitHub！"
    
    # 启用 GitHub Pages
    echo "正在启用 GitHub Pages..."
    gh repo edit --enable-github-pages
    
    echo "GitHub Pages 已启用！"
    echo "您的应用将在 https://[YOUR_USERNAME].github.io/jiujiu-todo-list 可用"
else
    echo "仓库创建失败。请确保已安装 GitHub CLI 并完成认证。"
    echo "安装 GitHub CLI: https://cli.github.com/"
    echo "登录: gh auth login"
fi