document.addEventListener('DOMContentLoaded', showRandomFact);

const funFacts = [
    "USSR_ENJOYER from Season 1 takes place back in SPT 3.5.5 with its last raid being almost 2 years ago!",
    "Leaderboard was never meant to be made as an SPT mod",
    "First cheater was banned 2 hours after official launch.",
    "GitHub Pages hosts this for free!",
    "Disqualified players get a ghost emoji on their profile. Spooky... or sad?",
    "Season system was implemented to control the chaos",
    "We track skill issues, too.",
    "Leaderboard is the first mod to break offline laws of SPT and let offline players unite together in its exotic way (looking at you, Fika)",
    "Embrace simplicity. This website works with only JS and JSON. No registration and SMS 💪"
  ];

  function showRandomFact() {
    const randomIndex = Math.floor(Math.random() * funFacts.length);
    document.getElementById("highlight").textContent = funFacts[randomIndex];
  }