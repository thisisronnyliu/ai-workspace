# 啾啾项目仓库

欢迎来到 啾啾 项目仓库！这里存放着所有通过 啾啾 构建的项目。

## 项目列表

### [Todo List 应用](./todo-list-app/)
一个美观简约、功能齐全的待办事项应用，具有现代化UI设计和流畅的交互体验。

- 添加、编辑、删除任务
- 标记任务完成/未完成
- 任务筛选（全部/未完成/已完成）
- 实时统计数据
- 批量操作（清除已完成/清空全部）
- 响应式设计
- 本地数据存储
- 流畅的动画效果

### [备忘录管理系统](./memo-system/)
一个功能丰富、界面美观的备忘录管理应用，支持多种实用功能，帮助用户高效管理日常任务和提醒。

- 添加、编辑、删除备忘录
- 标记完成/未完成状态
- 过滤显示（全部/未完成/已完成）
- 实时统计数据
- 批量操作（清除已完成）
- 数据导出功能
- 响应式设计
- 本地数据存储

### [餐厅点餐系统](./restaurant-order-system/)
一个功能完善、界面友好的餐厅数字化点餐系统，为顾客提供便捷的自助点餐体验，同时为餐厅提供高效的订单管理功能。

- 分类浏览菜单（开胃菜、主菜、甜品、饮品）
- 显示菜品名称、价格、详细描述
- 支持菜品数量调整
- 实时计算订单总额
- 桌号登记与人数统计
- 订单管理和提交功能
- 响应式设计，适配多设备

### [多轮录音分析](./recording-analysis/)
一个面向连续语音记录和整理的录音分析工具，支持多轮录音、文字识别、备注管理和数据导出。

- 按住按钮快速录音
- 实时语音识别与文本记录
- 多条录音记录列表展示
- 支持记录选择与批量导出 CSV
- 为单条记录添加备注
- 复制文字与删除记录
- 响应式设计，适配多设备

## 项目结构

```
ai-workspace/
├── index.html          # 项目汇总主页
├── README.md           # 全部项目的说明
├── todo-list-app/      # Todo List 应用
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── README.md
│   └── ...
├── memo-system/        # 备忘录管理系统
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   ├── README.md
│   └── ...
├── restaurant-order-system/  # 餐厅点餐系统
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── images/
│   ├── README.md
│   └── ...
├── recording-analysis/  # 多轮录音分析
│   ├── index.html
│   └── tests/
├── xxx-app/      # xxx 应用
```

## 说明

- 从项目结构中可以看出，该仓库可包含多个项目应用
- 每个项目应用目录必须存放于根目录下，相互独立、互不影响
- 最后由根目录下的 `index.html` 、 `README.md` 将各项目应用进行汇总说明

## 访问地址

- 项目主页: https://thisisronnyliu.github.io/ai-workspace/
- Todo List 应用: https://thisisronnyliu.github.io/ai-workspace/todo-list-app/
- 备忘录管理系统: https://thisisronnyliu.github.io/ai-workspace/memo-system/
- 餐厅点餐系统: https://thisisronnyliu.github.io/ai-workspace/restaurant-order-system/
- 多轮录音分析: https://thisisronnyliu.github.io/ai-workspace/recording-analysis/

## 许可证

MIT
