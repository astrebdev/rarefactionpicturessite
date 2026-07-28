HOW TO ADD YOUR OWN VIDEOS
===========================

1. REEL (cinematography.html)
   - Drop your file in here, e.g. videos/reel.mp4
   - Open cinematography.html, find the <video class="reel-video"> tag
   - Replace the <source src="..."> URL with: videos/reel.mp4
   - Keep autoplay muted loop playsinline — required for it to
     autoplay in the browser (browsers block autoplay with sound)

2. TRAILERS (film modal — click a film card to see it)
   - Drop trailer files in here too, e.g. videos/the-routine-trailer.mp4
   - Open films-data.js
   - Find the film's entry (e.g. "the-routine")
   - Set trailerSrc: "videos/the-routine-trailer.mp4"
   - Optional: set poster to a still image path (e.g. "images/the-routine-still.jpg")
     shown for a split second before the video loads. Leave it as ""
     if you don't have one yet — an empty poster is better than a
     mismatched one.

FILE TIPS
   - Use .mp4 (H.264 codec) — plays everywhere without extra setup
   - Keep files reasonably compressed: aim under ~20-30MB for trailers,
     under ~50MB for the reel, so pages don't feel slow to load
   - Free tools to compress: HandBrake (desktop app) or
     Squoosh/CloudConvert (browser-based)

Until real files are added, the reel and all trailers point to small
public domain/CC-licensed placeholder clips so the players aren't
empty — that's expected and not a bug.
