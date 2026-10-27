# IG Auto-Replier

A small, self-hosted ManyChat alternative for Instagram.

When someone comments a keyword on one of your posts (for example **"GUIDE"**), it:

1. **sends them a DM** automatically (text, optionally with link buttons), and
2. **replies publicly** to their comment ("Check your DMs! 📩").

It can also auto-reply to **DMs** that contain a keyword.

It uses Instagram's official API (the same one ManyChat uses), so there's no
password sharing and no risk of your account getting flagged for automation.

---

## How it works

```
Someone comments "guide"  ──►  Instagram  ──►  your server (/webhook)
                                                 │ matches a rule in rules.json
                                                 ├─► sends them a DM
                                                 └─► replies to the comment
```

Instagram notifies your server whenever there's a new comment or DM (this
notification is called a "webhook"). The server checks your rules and responds.

---

## What you need

- An Instagram **Professional account** (Business or Creator). Switch in the
  Instagram app: *Settings → Account type and tools → Switch to professional account*.
- A free **Meta developer account**: https://developers.facebook.com
- A place to run this server with a public `https://` address
  (e.g. [Render](https://render.com), [Railway](https://railway.app), a VPS,
  or [ngrok](https://ngrok.com) for testing from your own computer).
- Node.js 20.12 or newer.

---

## Setup

### 1. Configure your rules

Edit `rules.json` (it starts as a copy of `rules.example.json`). Example:

```json
{
  "commentRules": [
    {
      "name": "Free guide",
      "keywords": ["guide", "free guide"],
      "match": "word",
      "posts": [],
      "commentReplies": ["Sent you a DM {username} 📩", "Check your DMs! 🙌"],
      "dm": {
        "text": "Hey {username}! Here's your free guide:",
        "buttons": [{ "title": "Get the guide", "url": "https://example.com/guide" }]
      }
    }
  ],
  "dmRules": [
    { "name": "Price", "keywords": ["price"], "reply": "Plans start at $19/month!" }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `keywords` | Words that trigger the rule (capital letters and accents don't matter). |
| `match` | `word` (default): keyword appears as a whole word, so "guide pls" matches but "guidebook" doesn't. `contains`: anywhere in the comment, so "guidebook" matches too. `exact`: the comment is only the keyword, like "GUIDE!!". |
| `posts` | Leave `[]` for all posts, or list post (media) IDs to limit the rule to those posts. |
| `commentReplies` | Public replies. One is picked at random each time, which looks more natural. Optional. |
| `dm` | The private message. Plain text (`"dm": "hello"`) or `{ "text", "buttons" }` with up to 3 link buttons. Optional. |
| `{username}` | Replaced with the commenter's `@username`. |

Rules are checked top to bottom and the first match wins. The server reloads
`rules.json` automatically when you save it, so there's no need to restart.

### 2. Create a Meta app

1. Go to https://developers.facebook.com/apps → **Create app**.
2. Choose the **"Instagram"** use case / product. Use the
   **"API setup with Instagram login"** option.
3. Under **Generate access tokens**, click **Add account** and log in with
   your Instagram professional account. Copy the generated **access token**.
4. Copy the **Instagram app secret** shown on the same page.

### 3. Fill in `.env`

```bash
cp .env.example .env
```

| Variable | Value |
| --- | --- |
| `VERIFY_TOKEN` | Any random string you make up (e.g. `my-secret-123`). |
| `APP_SECRET` | The Instagram app secret from step 2. |
| `IG_ACCESS_TOKEN` | The access token from step 2. |

### 4. Start the server

```bash
npm start
```

You should see `Connected to Instagram account @yourname`.

If you're testing on your own computer, expose it with ngrok:
`ngrok http 3000`. That gives you a public `https://….ngrok-free.app` URL.

### 5. Connect the webhook

In your Meta app, under **API setup with Instagram login → Configure webhooks**:

- **Callback URL:** `https://YOUR-SERVER/webhook`
- **Verify token:** the same `VERIFY_TOKEN` from your `.env`
- Click **Verify and save**, then **subscribe** to the **`comments`** and
  **`messages`** fields.

Make sure webhooks are turned on for your Instagram account (the toggle next to
your account in the token section).

### 6. Test it

Comment one of your keywords on your post **from a different account** (the
bot ignores your own comments). The DM and reply should arrive within seconds,
and the server logs show what happened.

To test without sending anything for real, set `DRY_RUN=true` in `.env`. The
server then logs what it *would* send.

---

## Going live for everyone (important)

While your Meta app is in **Development mode**, it only responds to people
who have a role on the app (you, plus testers you add under *App roles*). To
make it work for **all** your followers:

1. Switch the app to **Live** mode.
2. Request **Advanced Access** for `instagram_business_manage_comments` and
   `instagram_business_manage_messages` through **App Review**. Meta asks for a
   short screencast showing the feature and a privacy policy URL.

---

## Keep your token fresh

The long-lived access token lasts **60 days**. Refresh it before then (it
must be at least 24 hours old):

```bash
curl "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=YOUR_TOKEN"
```

Put the new token in `.env` and restart.

---

## Instagram's limits (good to know)

- Each comment can trigger **one** DM, and only within **7 days** of being
  posted. These are Instagram's rules, and ManyChat has the same limits.
- Regular DM replies (`dmRules`) work within **24 hours** of the person's
  last message to you.
- If Instagram rejects the link buttons, the bot automatically sends the same
  message as plain text with the links written out.
- Already handled comments are remembered in `data/state.json`, so
  Instagram's retries never cause double DMs.

---

## Deploying on Render (easiest)

The repo includes a `render.yaml`, so Render sets everything up for you:

1. Sign up at https://render.com with your GitHub account.
2. Click **New → Blueprint**, pick this repository, and click **Apply**.
3. When asked, paste your **`APP_SECRET`** and **`IG_ACCESS_TOKEN`**.
   (`VERIFY_TOKEN` is generated for you. Find it under the service's
   **Environment** tab.)
4. Your callback URL is `https://<your-service>.onrender.com/webhook`.

To change your keywords and messages, edit `rules.json` on GitHub. Render
redeploys automatically.

Note: Render's free plan goes to sleep after 15 minutes without traffic. The
first comment after a quiet period can take about a minute (Instagram retries
for you). The $7/month plan stays awake.

---

## Development

```bash
npm test
```

No dependencies. The project only uses Node's built-in modules.

| File | Purpose |
| --- | --- |
| `src/server.js` | Webhook endpoint, signature check, startup |
| `src/handlers.js` | Decides what to do for each comment / DM |
| `src/rules.js` | Loads rules and matches keywords |
| `src/instagram.js` | Calls the Instagram API |
| `src/store.js` | Remembers handled comments so nothing is sent twice |
