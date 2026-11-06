# GTA 6 launch: stream plan + fast clip system

Goal: go live on **YouTube, Twitch and Kick** at launch, and leave every stream with **3+ clips** ready for 2 reels a day.

> Assumption: you play on a console (GTA 6 is PS5/Xbox only) and stream from your PC (RX 6750 XT) through a capture card. If you don't have a capture card, see "Plan B" at the bottom, and tell me so I can change this.

---

## 1. One-time setup (finish by Tue 17, test that night)

| Step | What to do |
|---|---|
| Capture | Console → **capture card with passthrough** (1080p60, e.g. Elgato HD60 X class) → PC. TV plugged into the passthrough. |
| PS5 only | Settings → System → HDMI → **turn off "Enable HDCP"** or the capture card shows a black screen. (Turn it back on for Netflix.) |
| OBS output | 1920×1080 · 60 fps · encoder **AMD H.264 (AMF)** · bitrate **6000 kbps** (Twitch's max). GTA 6 runs at 30 fps on console; 60 fps output keeps your facecam smooth. |
| Multistream | **Aitum Multistream** (free OBS plugin) sends to all 3, but each one uses its own upload (~3 × 6 Mbps ≈ 20 Mbps). If your upload is under ~25 Mbps, use **Restream** instead (one upload; check which plan allows 3 channels). |
| Twitch rules (2026) | Simulcasting is allowed for Affiliates and Partners, but: Twitch can't get **lower quality** than the others, you can't tell Twitch viewers to go watch you elsewhere, and **don't show a merged chat** on stream. Keep the merged chat on your second screen. |
| Music | No official streamer mode yet → set the **in-game radio volume to 0** on stream, otherwise Twitch can mute your VOD. Use no background music. |
| Vertical canvas | **Aitum Vertical** (free OBS plugin): a second 1080×1920 canvas with its own facecam + gameplay crop (layout A below) and its own replay buffer. Your clips come out **already vertical**. |
| Replay buffer | OBS → Settings → Output → Replay Buffer: **90 s**. Hotkey **F9** = "save replay" on both canvases. That's your clip button. |
| Test | Tue 17 night: a 10-minute **unlisted/private** test on all 3 (audio levels, facecam, F9 saves a file in both formats). |

## 2. Schedule (Morocco time, same slots on all 3 platforms)

| Day | Live | What |
|---|---|---|
| **Wed 18** | **23:00 → ~04:00** | 🔴 **LAUNCH NIGHT**: pre-show, countdown, unlock at 00:00, first hours |
| Thu 19 | 20:00 → 00:00 | Story day 1 (after you sleep and post the first clips) |
| Fri 20 | 20:00 → 00:00 | Free roam: 6-star test, police test, Vice City at night |
| Sat 21 | 16:00 → 22:00 | Long weekend stream: story + challenges from chat |
| Sun 22 | 16:00 → 20:00 | Gym / fishing / gators + "Moroccan easter egg hunt" |
| From week 2 | Tue · Thu · Sat · Sun | Same hours every week, so people learn your schedule |

## 3. Launch-night run of show (Wed 18)

| Time | Segment | Notes |
|---|---|---|
| 23:00 | **Pre-show** ("Just Chatting" scene, big facecam) | Hello, the reviews' scores (from reel #22), the schedule |
| 23:20 | Chat game | "Which character will betray them?" (callback to reel #10) |
| 23:40 | Final checks | Show the pre-load is 100%, controller charged, tea poured 🍵 |
| 23:55 | **Countdown** on screen | Clip it: F9 at 00:00 |
| 00:00 | **Unlock** → switch to the gameplay scene | Clip your first reaction (F9) |
| 00:00–00:30 | Opening | Don't talk over cutscenes; react after |
| 00:30–03:30 | Play | Press F9 on every funny / wow / fail moment. Aim for 15+ saves |
| ~04:00 | End | "Tomorrow 20:00, same place." Raid or host someone on Twitch |

**Spoilers:** call the stream "LAUNCH NIGHT · SPOILERS". In **reels**, keep story cutscenes out for the first week (people hate spoilers); post gameplay, reactions and tests instead.

## 4. Clip hunt: moments to create on purpose (each one = a reel)

| # | Moment to film on stream | Reel title (Darija) |
|---|---|---|
| 1 | Your face at 00:00 + the first 60 s | «أول دقيقة فـGTA 6» |
| 2 | Reach 6 stars as fast as possible | «جربت نوصل 6 نجوم» |
| 3 | Commit a crime → change clothes and car → do the police still find you? | «واش البوليس كيعرفوك إلا بدلتي الحوايج؟» |
| 4 | Drive across Vice City at sunset/night, no HUD, no radio | «Vice City فالليل» (immersive) |
| 5 | Performance check: fast pan, crowded street (30 fps) | «GTA 6 على PS5: كيفاش داير الفريم؟» |
| 6 | Search for anything Moroccan (restaurant, flag, couscous, Darija on signs) | «قلبت على المغرب فـLeonida» |
| 7 | 1 hour in the gym → body change before/after | «ساعة ديال الرياضة فـGTA 6» |
| 8 | Pet the dog / scold the dog | «مسحت على الكلب… وغوتت عليه» |
| 9 | Night airboat + alligator | «التماسيح فالليل» |
| 10 | An NPC fights back during a robbery | «حتى الناس ولاو كيضاربو» |
| 11 | The funniest fail of the night | «أغرب حاجة وقعات ليا فاللايف» |
| 12 | Compare a spot to its real Miami location (screenshot side by side) | «GTA 6 vs Miami الحقيقية» |

## 5. The clip pipeline (how you get 2 reels a day without stress)

1. **During the stream:** press **F9** → OBS saves the last 90 s, horizontal **and** vertical. Say the clip number out loud ("clip 3!") to find it fast.
2. **Right after the stream (20 min):** open `D:\my-videos\gta6-live\YYYY-MM-DD\`, keep the best 3, rename them `MMDD_01_hook-word.mp4`. Delete the rest.
3. **Next morning (45 min):** edit 2 vertical clips: cut to the first second of action, add the hook text in the caption band (layout A), the chip "🔴 LIVE CLIP", and an end card "LIVE كل ليلة 20:00". Or send me the files and I'll batch them with your Remotion workflow.
4. **Post:** 13:00 and 20:00. Pin a comment with the stream schedule.
5. **YouTube:** the long VOD stays on YouTube; also upload the best clip as a Short. Keep graphic violence **out of the first 7 seconds and the thumbnail** (YouTube's 2026 gaming rules can limit ads).

## 6. Clip reels after launch (all from the stream)

| Day | 13:00 | 20:00 |
|---|---|---|
| Thu 19 | L1 «أول دقيقة فـGTA 6» | L2 «جربت نوصل 6 نجوم» |
| Fri 20 | L3 «واش البوليس كيعرفوك إلا بدلتي الحوايج؟» | L4 «Vice City فالليل» |
| Sat 21 | L5 «GTA 6 على PS5: كيفاش داير الفريم؟» | L6 «قلبت على المغرب فـLeonida» |
| Sun 22 | L7 «ساعة ديال الرياضة فـGTA 6» | L8 «أغرب حاجة وقعات ليا فاللايف» |

If a moment doesn't happen, swap in another one from the clip-hunt list.

## 7. Layouts (pixel specs; images in `layouts/`)

### A · Vertical clip: "split" (default for reactions)
`layouts/vertical-split.png` · canvas **1080×1920**
- **Facecam**: top, 1080×640 (y 0–640). Frame your eyes at about y 380 (below Instagram's top UI).
- **Gameplay**: 1080×1280 (y 640–1920). The 1920×1080 source is scaled to 1280 px high and cropped to the centre 1080 px. Move the crop when the action is on the side.
- **Caption band**: on the seam (y 560–720): Lalezar, white on a navy pill with a cyan outline.
- **Safe zone**: keep text inside x 60–940, y 250–1540. Instagram's buttons cover the right edge and the bottom ~380 px.

### B · Vertical clip: "scenery" (for driving, sunsets, Vice City at night)
`layouts/vertical-scenery.png`
- Background: the same gameplay, **blurred and darkened**, filling 1080×1920.
- Gameplay: full 16:9 width, 1080×608, centred (y 656–1264). Nothing is cropped, so wide shots stay beautiful.
- Facecam: a **circle**, 380 px, top centre (y 230–610), cyan ring.
- Caption: under the gameplay (y 1300–1480).

### C · Stream 16:9
`layouts/stream-16x9.png` · canvas **1920×1080**
- Gameplay full screen.
- Facecam: **bottom-right**, 480×270, rounded corners, 4 px cyan border. GTA's minimap is bottom-left and the wanted stars are top-right, so bottom-right stays free.
- Small top-left tag "🔴 GTA 6 · LIVE" (fades after 10 s; GTA puts help text there).
- "Just Chatting" scene for the pre-show: big facecam (1280×720) on the left, a countdown and the schedule on the right.

## Plan B (no capture card)
- PS5 can broadcast straight to **Twitch or YouTube** (one platform, no Kick, no custom layout). Pick YouTube (your VOD stays and it's easy to clip), add your camera with the PS HD Camera if you have one, and record clips with the PS5's "Create" button (last 15 s–1 h). It works, but you lose layout A and the 3-platform simulcast. A capture card is worth buying before Wed 18.
