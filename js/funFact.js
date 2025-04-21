document.addEventListener('DOMContentLoaded', showRandomFact);

const funFacts = [
    "USSR_ENJOYER takes place back in SPT 3.5.5 with its last raid being almost 2 years ago!",
    "Leaderboard was never meant to be made as an SPT mod",
    "First cheater was banned 2 hours after official launch.",
    "GitHub Pages hosts this for free!",
    "This website uses pure data. Vegan leaderboard...",
    "Disqualified players get a ghost emoji on their profile. Spooky... or sad?",
    "Smile! Your failures are live-streamed to the leaderboard!",
    "Season system was implemented to control the chaos",
    "We track skill issues, too.",
    "Leaderboard is the first mod to break offline laws of SPT and let offline players unite together (subtle Fika foreshadowing)"
  ];

  function showRandomFact() {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    document.getElementById("highlight").textContent = funFacts[randomIndex];
  }