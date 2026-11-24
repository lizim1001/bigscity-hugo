# MAIRL · Managerial AI Research Lab

## 用 Hugo 本地预览

在 VS Code 打开本文件所在的 `lab-prototypes` 文件夹。在集成终端执行：

```bash
hugo server
```

浏览器访问 <http://localhost:1313/>。Hugo 会监听模板、数据和内容改动。按 `Ctrl+C` 停止服务。

如果终端找不到 Hugo，在其他 Mac 上，可用 Homebrew 安装后运行 `hugo server`：

```bash
brew install hugo
```

在同一个目录执行 `hugo` 可生成静态部署文件，默认输出到 `public/`。生产环境的域名和输出目录见 `config/production/hugo.toml`。

## 网站内容

- `content/_index.md` 保存首页简介。
- `content/projects/` 和 `content/members/` 分别保存开源项目与成员资料。
- `data/publications_database.json` 是论文库的数据源。论文列表、成员页的关联论文和全站搜索都读取这份数据。
- `data/publication_labels.json` 保存论文分类的显示名称。
- `layouts/` 是 Hugo 模板，`static/showcase.css` 是展示站的配色和组件样式。
- `designs/` 中的版本用于查阅设计历史。日常预览和构建从项目根目录启动。

## 成员：照片、简介和链接

编辑 `content/members/<member-id>/index.md`，照片放在 `static/photos/`：

```yaml
---
title: 真实姓名
name_en: English Name
member_id: your-id
role: 博士生
position: 真实单位
photo: /photos/your-photo.jpg
homepage: https://真实个人主页/
github: https://github.com/真实账户
scholar: https://scholar.google.com/citations?user=真实ID
dblp: https://dblp.org/pid/真实ID.html
email: 真实邮箱
author_names: [论文中使用的姓名]
order: 10
draft: true
---

这里填写个人介绍、研究兴趣和经历。
```

照片、简介和真实链接直接出现在成员卡片；成员个人页提供完整介绍和自动汇聚的论文。空链接不会出现按钮。

王静远老师的照片和简介沿用旧站本人资料，已接入现有个人主页及经核对的 DBLP。准确的个人 GitHub / Scholar 链接和学生资料按提供的信息补入。
