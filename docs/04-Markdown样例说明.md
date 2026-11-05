# 栏目首页 + 论文子页面 Markdown 样例

样例在 `docs/examples/content/`，不在 content 内，因此**不会发布**。样例是格式展示，不是真实论文。draft:true 防止复制后误上线。

## 1. 样例文件及最终对应位置

```text
docs/examples/content/publications/
├── _index.md
└── example-urban-flow-2026/
    └── index.md
```

若是一个全新的普通栏目，可把 publications 改为其他不冲突 slug，并复制到 content；同步更改正文链接和资源命名。

**当前 content/publications/_index.html 已存在，不能直接把样例 _index.md 再放进去。** 当前最常见任务只是新论文：创建 `content/publications/<真实slug>/index.md`，不替换旧栏目首页。

## 2. Publications 主页面也改用 Markdown 时

这是明确的转换任务，不是追加论文步骤。AI 应先：

1. 备份并读取现有 _index.html，保存所有真实条目、分组、链接及排版需求。
2. 确认用户要保留哪些旧内容；样例不能代替全量原论文列表。
3. 将 _index.html 替换为 _index.md，不能两者并存；按转换方案处理 legacy_key，核对原框架。
4. 选一种列表方案：手动完整列表，或明确实现自动列表，不使用两套重叠入口。

特别注意现有 baseof：在 `/publications/` 后自动追加非 legacy_key 的论文。下面样例首页手动链接了示例论文，若直接在此地址启用且论文取消 draft，会造成重复入口。手动列表方案必须调整现有自动追加逻辑；自动方案则从首页正文去掉重复手写论文链接。

如果仅在一个新栏目 `/publication-demo/` 实验，该地址不触发现有自动追加，但仍需完整改名所有链接；它只是实验栏目，不代表已转换真实 Publications。

## 3. 新论文页最少需要什么

必须：一个 index.md。图片、PDF 都是可选，存在真实文件才添加链接。

资源推荐：

```text
static/assets/img/publications-<slug>-framework.png
static/downloads/<slug>-paper.pdf
```

论文初始模板在 archetypes/publication.md；样例不是自动渲染模板。新页框架由 layouts/_default/baseof.html 和 data/legacy.json 的 default 提供。

## 4. 演示用提示词

```text
请阅读 docs/04-Markdown样例说明.md 和样例文件，只解释结构，不修改真实 Publications。
然后用我提供的真实论文材料新建一篇论文详情页，保持原栏目首页不变。
```

如果确实想做独立实验：明确要求 AI 创建新 slug 的草稿栏目并改好所有链接，预览使用 -D。不要仅取消 docs 样例的 draft 并当成真实成果发布。
