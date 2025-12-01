export const newsAdminPage = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BVMW News-Editor</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f6f7fb; color: #1f2933; }
      h1 { margin-top: 0; }
      .grid { display: grid; gap: 24px; grid-template-columns: 1fr 1fr; align-items: start; }
      form { background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); display: grid; gap: 12px; }
      label { font-weight: 600; }
      input, textarea { width: 100%; padding: 10px; border: 1px solid #d8dde6; border-radius: 8px; font-size: 14px; }
      textarea { min-height: 160px; resize: vertical; }
      button { padding: 12px 16px; background: #e30613; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
      button:disabled { opacity: 0.6; cursor: not-allowed; }
      .list { background: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
      .item { border-bottom: 1px solid #eceff4; padding: 12px 0; }
      .item:last-child { border-bottom: none; }
      .meta { color: #607083; font-size: 13px; margin-top: 4px; }
      .success { color: #0f9d58; font-weight: 600; }
      .error { color: #d93025; font-weight: 600; }
      @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <h1>News anlegen</h1>
    <div class="grid">
      <form id="news-form">
        <div>
          <label for="headline">Headline*</label>
          <input id="headline" name="headline" required />
        </div>
        <div>
          <label for="subline">Subline</label>
          <input id="subline" name="subline" />
        </div>
        <div>
          <label for="author">Autor*</label>
          <input id="author" name="author" required />
        </div>
        <div>
          <label for="imageUrl">Bild-URL</label>
          <input id="imageUrl" name="imageUrl" placeholder="https://..." />
        </div>
        <div>
          <label for="downloadUrl">Download-URL (PDF)</label>
          <input id="downloadUrl" name="downloadUrl" placeholder="https://..." />
        </div>
        <div>
          <label for="publishedAt">Veröffentlichungsdatum*</label>
          <input id="publishedAt" name="publishedAt" type="datetime-local" required />
        </div>
        <div>
          <label for="content">Text*</label>
          <textarea id="content" name="content" required></textarea>
        </div>
        <button type="submit">Speichern</button>
        <div id="status"></div>
      </form>
      <div class="list">
        <h2>Bestehende Artikel</h2>
        <div id="news-list">Lade…</div>
      </div>
    </div>

    <script>
      const statusEl = document.getElementById('status');
      const form = document.getElementById('news-form');
      const newsList = document.getElementById('news-list');

      async function loadNews() {
        newsList.textContent = 'Lade…';
        try {
          const response = await fetch('/api/news?limit=50');
          const data = await response.json();
          if (!Array.isArray(data.news) || data.news.length === 0) {
            newsList.textContent = 'Noch keine Artikel vorhanden.';
            return;
          }
          newsList.innerHTML = data.news
            .map((item) => {
              const date = new Date(item.publishedAt).toLocaleDateString('de-DE');
              return `<div class="item"><strong>${item.headline}</strong><div class="meta">${date} • ${item.author ?? ''}</div><div>${item.subline ?? ''}</div></div>`;
            })
            .join('');
        } catch (error) {
          newsList.innerHTML = '<div class="error">Konnte News nicht laden.</div>';
        }
      }

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        statusEl.textContent = '';
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        if (!payload.publishedAt) {
          statusEl.innerHTML = '<div class="error">Bitte Datum angeben.</div>';
          return;
        }
        form.querySelector('button').disabled = true;
        try {
          const response = await fetch('/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            throw new Error('Fehler beim Speichern');
          }
          statusEl.innerHTML = '<div class="success">Artikel gespeichert.</div>';
          form.reset();
          await loadNews();
        } catch (error) {
          statusEl.innerHTML = '<div class="error">' + (error?.message ?? 'Fehler') + '</div>';
        } finally {
          form.querySelector('button').disabled = false;
        }
      });

      loadNews();
    </script>
  </body>
</html>`;
