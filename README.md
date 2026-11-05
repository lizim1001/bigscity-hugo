# BIGSCity — 原版还原 Hugo 网站

这是保留原实验室网站外观的 Hugo 静态项目。旧页面保留 HTML，新页面推荐 Markdown；不需要部署到 GitHub，可使用实验室服务器。

## 新同学和 AI 从哪里开始

先读 [文档入口](docs/README.md)。让 AI 阅读 [项目速览](docs/01-项目速览.md) 和 [AI 内容维护指南](docs/02-AI内容维护指南.md)，再复制 [任务提示词](docs/03-任务提示词.md) 中相应任务。

完整操作见 [使用说明](使用说明.md)，样例及其边界见 [Markdown 样例说明](docs/04-Markdown样例说明.md)。根目录 AGENTS.md 提供自动化工具的工作入口。

## 快速命令

```powershell
hugo server --disableFastRender
hugo new content --kind publication publications/my-paper/index.md
hugo new content achievements/_index.md
hugo new content achievements/result-a/index.md
python tools/nav.py add --label "成果" --url /achievements/ --dry-run
hugo
```

上面的导航命令仅预览；确认后去掉 --dry-run。普通栏目需维护子页面链接；现有工具不创建下拉导航。Publications 当前会追加非 legacy_key 新论文。新建只是创建初始文件，还需要真实正文和资源。

## 项目边界

- 保留基线 250 个正式原站页以及原资源，不包含备份、temp 或 CDN 辅助错误 HTML。
- 原站 Current Visitors/登录等残留已清理，不重新加入。
- 修改源项目，不编辑 public；不要反复运行一次性 migrate_original.py。
- static 资源随构建复制，public 是部署成品；只交 public 无法恢复完整可维护源项目。
- 原站远程后端、第三方服务或缺失资源不会因 Hugo 迁移自动恢复。
- deploy 和 GitHub workflow 是可选示例，发布需核对环境并单独授权。
