# Akshay — Portfolio Website + About-Me Chatbot

A portfolio site with scroll fade-in animations and a small chatbot that
answers visitor questions about Akshay (education, skills, projects, contact).

```
akshay-portfolio/
├── frontend/          static site (HTML/CSS/JS)
│   ├── index.html
│   ├── css/style.css
│   └── js/main.js
└── backend/            Express API powering the chatbot
    ├── server.js
    ├── chatbot.js
    ├── data/knowledge.json   <- edit this to change what the bot knows/says
    └── package.json
```

## 1. Run it (easiest way — one server does both)

The backend also serves the frontend as static files, so you only need to run
one thing:

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:5000** — you'll see the site, and the chat
widget will work immediately (it calls `/api/chat` on the same server).

## 2. Run frontend and backend separately (optional)

If you'd rather host the frontend somewhere else (Netlify, GitHub Pages,
Vercel static hosting, etc.) and the backend somewhere else (Render, Railway,
a VPS, etc.):

1. Deploy `backend/` as a Node service (`npm install && npm start`). Note its
   public URL, e.g. `https://your-api.onrender.com`.
2. Open `frontend/js/main.js` and set:
   ```js
   const API_BASE_URL = "https://your-api.onrender.com";
   ```
3. Deploy the `frontend/` folder as a static site.

The backend already has CORS enabled, so cross-origin requests from your
static frontend will work.

## 3. Customize the chatbot

Everything the chatbot can say lives in `backend/data/knowledge.json`. Each
entry has:

```json
{
  "id": "mediconnect",
  "keywords": ["mediconnect", "healthcare", "appointment"],
  "answer": "MediConnect is ..."
}
```

- **keywords**: words/phrases that trigger this answer. Longer, more specific
  keywords (like a project name) automatically outrank generic ones.
- **answer**: what the bot replies with.

Add new entries or edit existing ones, restart the server, and the bot picks
up the changes immediately — no retraining needed. There's no external AI API
call here on purpose, so the chatbot works out of the box with zero API keys
and zero cost.

## 4. Things still to fill in

A few placeholders are marked clearly so you can find them fast:

- `frontend/index.html` → contact section: your real email and Instagram
  handle (search for `your-email@example.com` and `your-handle`).
- `frontend/index.html` → résumé download link (`#resumeLink`).
- `backend/data/knowledge.json` → add certificate names, or anything else
  you want the bot to be able to answer.

## 5. Editing the design

- Colors, fonts, and spacing are all defined as CSS variables at the top of
  `frontend/css/style.css` under `:root` — change them there and the whole
  site updates.
- The scroll fade-in effect is handled by the `.fade-target` class plus the
  `IntersectionObserver` in `frontend/js/main.js`. Add `fade-target` to any
  new element you want to fade in on scroll.
