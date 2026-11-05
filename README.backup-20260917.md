# BIGSCity — faithful Hugo migration

中文维护方法见 `使用说明.md`。

This version preserves the cleaned legacy `web` site's HTML body, per-page navigation, layout, styles, script registrations, image sizes, colors, columns and download cards. It does not convert old content into Markdown or redesign the site.

## Preview and build

```powershell
hugo server
hugo --destination public
```

Upload `public/` to the lab server's Nginx/Apache web root. Hugo is only required at build time; the production server only serves static files. The domain can be changed through `--baseURL https://your-domain/`. GitHub Pages is optional, not required.

## Add a publication

```powershell
hugo new content --kind publication publications/my-paper/index.md
```

Edit front matter (`title`, `authors`, `venue`, `year`) and the Markdown body. Upload attachments to `static/downloads/` and images to `static/assets/img/`. New publications automatically appear after the preserved entries on `/publications/`. Original entries remain in their original ordering.

## Add another page

```powershell
hugo new content my-page/index.md
```

Link to `/my-page/` from an existing content page. The new page uses the original left-sidebar shell. Existing submenu structures are preserved in the legacy shells; global navigation changes should be made deliberately rather than rewriting the original pages automatically.

## Edit existing content

`content/<original-path>/index.html` (or `_index.html` for section landing pages) contains YAML front matter followed by the original, unformatted body HTML. Keep its `legacy_key` and `url` fields. Only edit the body or use a new Markdown page for newly added material.

`data/legacy.json` contains the original per-page HTML surrounding the content area. Keeping each shell preserves different original navigation submenus and page-specific scripts. New Markdown pages share the `default` shell. The site assets are copied byte-for-byte under `static/`.

## Scope and limitations

- All 250 non-backup content pages are preserved, including historical duplicate student publication URLs.
- `temp`, `.backup_*`, font-test and mirrored CDN helper/error HTML are not content pages.
- Previously removed Current Visitors/Statcounter and login controls remain removed.
- Original missing resources, external embeds and the Jimdo contact-form backend are not recreated. A static migration cannot provide the original remote backend.
- Fidelity is measured against the local cleaned `web` snapshot, not against any later changes on Jimdo.

`tools/migration-manifest.json` records each source body hash. `tools/migrate_original.py` is a one-time import tool and refuses to overwrite an existing content directory. Do not repeatedly import after editing the Hugo content.
