# 部署指南：将 Todo List 应用部署到 GitHub Pages

## 方法一：使用 GitHub 界面创建仓库

1. 访问 [GitHub](https://github.com) 并登录您的账户
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称填入 `jiujiu-todo-list`
4. 选择 "Public"（公开）选项
5. 不要勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

## 方法二：上传文件到 GitHub 仓库

1. 在新创建的仓库页面，点击 "Upload files" 按钮
2. 将以下文件拖拽上传到仓库：
   - index.html
   - styles.css
   - script.js
   - README.md
   - package.json

3. 上传完成后，点击 "Commit changes" 按钮

## 方法三：启用 GitHub Pages

1. 在仓库页面，点击 "Settings" 标签
2. 向下滚动到 "Pages" 部分
3. 在 "Source" 下拉菜单中，选择 "Deploy from a branch"
4. 选择 "main" 分支和 "/" 文件夹
5. 点击 "Save" 按钮

## 完成部署

几分钟后，您的应用将在以下地址可用：
`https://[YOUR_USERNAME].github.io/jiujiu-todo-list`

其中 [YOUR_USERNAME] 是您的 GitHub 用户名。

## 通过命令行部署（如果您配置了 Git 和 GitHub 访问权限）

如果您已经配置了本地 Git 环境和 GitHub 访问权限，可以使用以下命令：

```bash
# 在项目根目录下执行
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[YOUR_USERNAME]/jiujiu-todo-list.git
git push -u origin main
```

然后按照上述步骤在 GitHub 设置中启用 Pages。

## 验证部署

部署完成后，您可以通过以下方式验证：
1. 访问您的 GitHub Pages URL
2. 确认应用的所有功能正常工作
3. 测试添加、编辑、删除和标记任务等功能