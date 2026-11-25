(() => {
  const gallery = document.querySelector('.paper-gallery');
  if (!gallery) return;

  const links = Array.from(gallery.querySelectorAll('[data-figure]'));
  const dialog = gallery.querySelector('dialog');
  const body = dialog.querySelector('.paper-lightbox-body');
  const caption = dialog.querySelector('header p');
  let opener;

  for (const link of links) {
    link.addEventListener('click', async event => {
      if (!dialog.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      const thumb = link.querySelector('img');
      const preview = new Image();
      preview.src = thumb.currentSrc || thumb.src;
      preview.alt = thumb.alt;
      preview.style.width = thumb.getAttribute('width') + 'px';
      body.replaceChildren(preview);
      caption.textContent = link.dataset.caption;
      dialog.showModal();

      const full = new Image();
      full.src = link.href;
      full.alt = thumb.alt;
      try {
        await full.decode();
        if (dialog.open && body.firstElementChild === preview) body.replaceChildren(full);
      } catch {
        if (dialog.open && body.firstElementChild === preview) {
          caption.textContent = link.dataset.caption + ' · 原图加载失败，可关闭后重试';
        }
      }
    });
  }
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());

  function warmImage(url) {
    return new Promise(resolve => {
      const image = new Image();
      image.fetchPriority = 'low';
      image.onload = image.onerror = resolve;
      image.src = url;
    });
  }

  async function warmRemainingResources() {
    const resources = JSON.parse(document.getElementById('homepage-resources').textContent);
    const images = new Set([...links.map(link => link.href), ...resources.photos]);
    const pending = Array.from(images, url => () => warmImage(url));
    for (const url of resources.other) {
      pending.push(async () => {
        const response = await fetch(url, { priority: 'low' });
        await response.arrayBuffer();
      });
    }
    async function downloadNext() {
      while (pending.length) {
        const download = pending.shift();
        try { await download(); } catch { /* A later visit can retry this resource. */ }
      }
    }
    await Promise.all([downloadNext(), downloadNext()]);
  }

  if (document.readyState === 'complete') warmRemainingResources();
  else window.addEventListener('load', warmRemainingResources, { once: true });
})();
