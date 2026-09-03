// ================================================================
// FILM DATA — edit this file to update what shows up in the trailer
// modal. Each key must match a card's data-film="key" attribute
// exactly (same key on the homepage card and the Work page card if
// it's the same film in both places).
//
// Leave any field as an empty string "" or empty array [] if you
// don't have that info yet — the modal skips blank fields instead
// of showing them empty.
//
// trailerSrc currently points to a placeholder (Big Buck Bunny,
// CC BY 3.0, Blender Foundation) just so the modal isn't empty.
// Swap it for your real trailer file once you have one, e.g.
// "videos/the-routine-trailer.mp4"
// ================================================================

const PLACEHOLDER_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const FILMS = {

  "the-routine": {
    title: "The Routine",
    year: "2026",
    runtime: "6 min",
    type: "Short Film",
    director: "Avery Streb, Shawna Streb",
    producer: "",
    dp: "Marlon Streb",
    starring: "Billy Gulkin, Avery Streb",
    licensing: "",
    awards: [],
    whereToWatch: "",
    trailerSrc: PLACEHOLDER_VIDEO,
    poster: ""
  },

  "noon": {
    title: "NOON",
    year: "2024",
    runtime: "28 min",
    type: "Short Film",
    director: "Avery Streb, Marlon Streb",
    producer: "",
    dp: "Marlon Streb, Avery Streb",
    starring: "Marlon Streb, Levi Hammond",
    licensing: "",
    awards: "Best VFX - SIMI Film Festival",
    whereToWatch: "<a href='https://www.youtube.com/watch?v=RJgvc25_xDE' target='_blank'>YOUTUBE</a>",
    trailerSrc: PLACEHOLDER_VIDEO,
    poster: ""
  },

  "daedalus": {
    title: "Daedalus",
    year: "2024",
    runtime: "13 min",
    type: "Short Film",
    director: "Avery Streb",
    producer: "",
    dp: "Marlon Streb",
    starring: "Hunter Uliasz, Morgan Jamison",
    licensing: "",
    awards: [],
    whereToWatch: "",
    trailerSrc: PLACEHOLDER_VIDEO,
    poster: ""
  }

};
