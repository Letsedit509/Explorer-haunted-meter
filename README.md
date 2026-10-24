# Explorer’s Haunted Meter

An animated, full-HD haunted meter inspired by the supplied design: original title, five numbers and rating labels, glowing liquid, waves, bubbles, and subtle smoke. The meter is redrawn as editable canvas artwork rather than using the reference image as a flat background.

## Transparent Overlay — no terminal needed

Download **Haunted-Meter-Standalone.html**, save it to your computer, and double-click it in Chrome or Edge. Everything is embedded, including fonts. The previous working standalone file is preserved, unchanged, as **Haunted-Meter-Cinematic-Original.html**.

1. At the top of the preview, choose **Transparent Overlay** under **Display mode**.
2. Leave **Checkerboard preview** enabled to see the clear areas. The checkerboard is an editor aid and is never exported.
3. Select any rating **1–5**, set the fill duration, and press **Play animation**. The original liquid movement is unchanged. Three subtle glow pulses follow the fill, without moving its endpoint.
4. Under **Export format**, select **PNG sequence ZIP · true transparency**.
5. Click **Export level** for the selected rating, or **Export all 5** for separate ZIP cards. After rendering, click **Save ZIP** on each card. A ZIP-ready message means rendering finished, not that it has been saved.
6. After saving, unzip your download. In Filmora, import the numbered PNG files as an **image sequence at 30 fps**, if your version offers that option, and place the result on a track above your footage. Transparent pixels reveal the footage below. Do not import every frame as an ordinary still-image clip.

Overlay exports are **1920 × 1080**, have true alpha transparency around the artwork, and contain the title, numbers, labels, borders, liquid, and subtle glow. They contain no surrounding smoke, scenery, controls, or checkerboard. The dark plate inside the meter remains part of the artwork so numbers and liquid are readable over footage.

**Transparent WebM** is available only if your browser passes a real encode/decode alpha test. If the test fails, the option is disabled and a message explains the PNG alternative. WebM codec support alone is insufficient. Even when the browser passes, test the clip in Filmora because Filmora's alpha support varies. The ordinary **WebM video · cinematic background** option remains available and always exports the original cinematic scenery.

The **Full-screen Cinematic** display mode preserves the original rendering, including smoke and all five animations. Overlay pulses do not change the cinematic animation. PNG exports always use the transparent overlay, regardless of the selected preview mode.

If your Filmora version cannot import PNG sequences, the ProRes 4444 conversion command below creates a transparent video intermediate. A compatible conversion tool is required; the app does not silently replace alpha with black or a chroma-key background.

## Preview it

Install Node.js 22 or newer if you are running this on your own computer. Open a terminal in this project folder and run:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000` in Chrome or Edge on your computer. In a cloud workspace, use its browser preview for **port 3000**, if available. The server binds to all interfaces. No API keys or external services are needed. Fonts are bundled locally. Stop the server with Ctrl+C.

## Make your animation

1. Choose **1–5**: Dead Zone, Slightly Active, Unexplained, Active, or Extreme.
2. Move **Fill duration** to set how many seconds the fill takes (1–10 seconds).
3. Press **Play animation**. Liquid fills from the left and stops precisely at the selected segment boundary. Bubbles, waves, and smoke keep moving afterward.
4. **Reset** empties the bar. Selecting another rating also resets it.
5. Choose **Transparent Overlay** to preview the transparent artwork. **Checkerboard preview** only changes the preview backdrop. The export format determines whether your file has transparency.

## Export for Filmora

Each export is 1920 × 1080, has no audio, and includes a two-second hold after filling. Use **Export level** for the selected rating or **Export all 5** for five separate files. PNG exports remain on screen as Save ZIP cards. Video exports may require permission for multiple downloads. **Cancel export** stops remaining work; files already downloaded stay in your Downloads folder.

**WebM video** is the easiest option: download and import it into Filmora as a video clip if your version supports WebM. It includes the cinematic dark background. Recording happens in real time; keep the tab visible and active. Actual frame timing depends on your computer.

**PNG sequence ZIP** preserves true transparency. Unzip it first. It contains numbered RGBA frames at exactly 30 fps, plus `IMPORT.txt`. If your Filmora version supports image sequences, import `frame_00000.png` as a sequence at **30 fps**. Importing every PNG as a normal still image will not give the correct timing.

For an alpha-capable video intermediate, install FFmpeg and run this command from the unzipped folder:

```sh
ffmpeg -framerate 30 -i frame_%05d.png -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le haunted-level-3.mov
```

The output is ProRes 4444 with alpha. Filmora’s codec and transparency support varies by version and operating system; test the result over another clip before exporting your project. The checkerboard itself is never included in the transparent PNG files.

PNG export renders every frame deterministically. Full-HD transparent sequences are large (roughly 115 MB for a three-second animation in testing); exporting all five can take time and memory. Export one rating at a time on lower-memory machines. Maximum-duration sequences can be several hundred MB each.

## Checks

```sh
npm test
```

Tests use Playwright with `/usr/bin/chromium` by default. Override `CHROMIUM_PATH` with the path to your Chrome/Chromium executable. They verify all five exact stops in both modes, reset, mobile layout, all five PNG sequences (decoded pixel alpha and fill endpoints), three ending pulses, WebM recording, batch exports, cancellation, standalone asset independence, and pixel-identical cinematic rendering against the preserved original. The app itself uses no runtime packages.

To regenerate the single-file standalone after source changes: `python3 scripts/build-standalone.py`. The build never modifies the preserved original.

## Edge ZIP saving fix

The old PNG exporter clicked a detached download link after rendering and treated that request as a successful save. Browser user activation can expire during rendering, so that handoff was unreliable and could silently fail. The new exporter validates the ZIP directory, retains its Blob and attached download link, and displays its actual MiB and byte sizes. It does not claim a ZIP was saved merely because rendering finished.

After all frames finish, click **Save ZIP**. In Edge, when supported, a save dialog opens: choose a folder and click **Save**. The app reports success only after the file write and close succeed. If saving fails or you cancel, the ZIP remains available for another attempt. **Download ZIP (fallback)** uses an ordinary attached Blob link, initiated by your fresh click. Check Edge’s Downloads list with **Ctrl+J**; the app cannot detect a browser silently blocking this fallback or confirm its eventual completion.

Keep the page open until your ZIP is saved. Use **Remove** to release a rendered ZIP from memory. All-five exports keep five separate cards, each with its own Save ZIP button. No ZIP URL expires on a timer. The standalone does not need a development server.

The 180-frame standalone ZIP was checked in managed Chromium through HTTP: native Blob-link download, exact file size, archive CRCs, and all 180 PNG members. Save-dialog success, cancellation, permission errors, and retry were tested with a simulated file-picker interface. Microsoft Edge is not installed here, and managed browser policy blocks `file://` navigation, so an actual local Edge save-dialog run could not be verified in this environment.
