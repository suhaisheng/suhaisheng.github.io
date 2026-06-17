# Academic Homepage

个人学术主页，静态站点，可部署至 [GitHub Pages](https://pages.github.com/)。

参考设计：[liyikang.top](https://liyikang.top/)

## 目录结构

```
academic-homepage/
├── index.html          # 主页面
├── css/style.css       # 样式
├── js/main.js          # 交互（导航、高亮）
├── assets/
│   ├── avatar.jpg      # 个人照片
│   └── cv.pdf          # 简历 PDF（自行添加）
└── README.md
```

## 本地预览

```bash
cd ~/Desktop/academic-homepage
python3 -m http.server 8080
```

浏览器访问 http://localhost:8080

## 自定义内容

编辑 `index.html` 中以下占位内容：

| 区域 | 说明 |
|------|------|
| `Your Name` | 姓名 |
| `hero-title` | 职称与单位 |
| `hero-bio` | 个人简介与研究兴趣 |
| `#news` | 近期动态 |
| `#projects` | 项目列表 |
| `#publications` | 论文列表 |
| `#service` | 学术服务（审稿、PC、助教等） |
| `#awards` | 奖项与荣誉 |
| `#experience` | 经历与教育 |

将个人照片放入 `assets/avatar.jpg`，简历放入 `assets/cv.pdf`。

## 部署到 GitHub Pages

### 方式一：用户/组织主页（`username.github.io`）

1. 在 GitHub 创建仓库，命名为 `你的用户名.github.io`
2. 将本目录所有文件推送到仓库 `main` 分支
3. 打开仓库 **Settings → Pages**，Source 选择 **Deploy from a branch**，Branch 选 `main` / `/ (root)`
4. 等待几分钟后访问 `https://你的用户名.github.io`

```bash
cd ~/Desktop/academic-homepage
git init
git add .
git commit -m "Initial academic homepage"
git branch -M main
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git push -u origin main
```

### 方式二：项目主页（`username.github.io/repo-name`）

1. 创建任意名称的仓库（如 `academic-homepage`）
2. 推送代码后，在 **Settings → Pages** 中启用 GitHub Pages
3. 若使用项目页，需在 `index.html` 的 `<head>` 中添加 base 标签：

```html
<base href="/repo-name/">
```

## 功能特性

- 响应式布局，支持手机端
- 固定顶栏导航，平滑滚动
- News / Projects / Publications / Experience 分区
- 无构建依赖，纯 HTML + CSS + JS
