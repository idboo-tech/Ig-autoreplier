# Meta App Review: idboo autoreplier

Texts to paste into App Review, plus the screencast script. App ID 2527450637776604,
Instagram account @idboo_, privacy policy https://ig-autoreplier.onrender.com/privacy.

## App description (shared by both permissions)

idboo autoreplier is a private tool used only by the Instagram creator account @idboo_
(indie games content). When a person comments a keyword such as "FREE" or "GAME" on one of
@idboo_'s posts, the app sends that person one private reply with the link they asked for
(for example the store page of the game shown in the video) and posts a short public reply
under their comment ("Check your DMs"). It only acts on comments made on @idboo_'s own posts
and only replies once per comment. It does not post content, read other accounts, or store
comment text. There is no public sign-up: the only account connected is @idboo_.

## instagram_business_manage_comments

**How will your app use this permission?**

The app receives the `comments` webhook for @idboo_'s posts, reads the comment text to check
it against a short list of keywords set by the account owner (for example "FREE", "GAME",
"COLLAB"), and, when it matches, posts one public reply to that comment through the
`/{comment-id}/replies` endpoint, such as "Check your DMs 🎮📩". It also uses the comment ID to
send the commenter a private reply (see the messages permission). Comments that don't match a
keyword are ignored, and the account's own comments are never answered. This permission is
necessary because without it the app can neither read the comment that triggers the reply nor
publish the reply.

**Testing instructions for the reviewer**

1. Open any recent post on instagram.com/idboo_ (less than 7 days old).
2. From any Instagram account, comment `FREE` on a FREE DROP post, or `GAME` on a game post.
3. Within about a minute (the server may need to wake up), a public reply appears under the
   comment, and the commenting account receives a DM with a button linking to the game page.

## instagram_business_manage_messages

**How will your app use this permission?**

When a comment matches a keyword, the app sends the commenter one private reply via
`POST /me/messages` with `recipient: { comment_id }`, containing the link they asked for
(a button template, or plain text with the link written out if buttons are not accepted).
It sends one message per comment, within 7 days of the comment, and only as a direct response
to that person's own comment. The app never sends unsolicited or promotional messages, never
messages people who did not comment a keyword, and stores only the IDs of comments that were
already answered, so the same person is never messaged twice for one comment. This permission
is necessary because the private reply with the requested link is the core of the feature.

**Testing instructions for the reviewer**

Same as above: comment `FREE` or `GAME` on a recent @idboo_ post, then open that account's
Instagram inbox (it may appear under Message requests). The DM arrives within about a minute.

## Screencast script (about 60–90 seconds, one take is fine)

Meta wants to see the whole flow on screen, with captions or narration in English.

1. **(0–10 s) Show the app is connected.** Meta developer dashboard → idboo autoreplier →
   Use cases → Instagram API → "API setup with Instagram login", showing @idboo_ in
   "Generate access tokens" with Webhook Subscription **On**. Caption: "The app is connected
   only to our own account @idboo_."
2. **(10–30 s) A person comments.** On a phone or a second browser, logged in as a different
   account (e.g. @idknidc9), open a recent @idboo_ post and comment `FREE`.
   Caption: "A follower comments the keyword FREE."
3. **(30–50 s) The public reply appears.** Refresh the comments: the reply from @idboo_
   ("Check your DMs 🎮📩" or "Sifetlik f DM … 🔥") is shown under the comment.
   Caption: "instagram_business_manage_comments: the app reads the comment and replies publicly."
4. **(50–75 s) The DM arrives.** Open that account's inbox / Message requests and show the
   message from @idboo_ with the "Claim the games" button, then tap it so the link opens.
   Caption: "instagram_business_manage_messages: one private reply with the requested link."
5. **(75–90 s) Optional:** show the Render logs for the same moment
   ("Comment from @… matched", "DM sent", "replied to comment").

Tips: record at 1080p or higher, keep the cursor visible, no music needed, upload as MP4.
For the recording to work before approval, the commenting account must be an Instagram
Tester on the app (App roles → Roles), and a rule with a real link must be active.
