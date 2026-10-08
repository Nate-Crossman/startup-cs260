import React from 'react';

export function HowToPlay() {
  return (
    <main>
      <h2>RULES OF THE GAME</h2>
      

      <p className="text-start mb-3">
        The Intense Epic War of Words is a party game to be played with at least three players. The regular order of play proceeds as follows:
      </p>
      <p className="text-start mb-3">
        In each round, one player is selected to be the "Judge". The Judge begins each round by submitting a prompt.
        This prompt can be anything. A question, a fill-in-the-blank, a niche inside joke between your friends.
        Anything goes for this prompt! Just try to make it so players have something to respond to.
        Or don't. There are no rules in the War of Words, besides of course the ones you're reading right now.
      </p>
      <p className="text-start mb-3">
        Once the judge has created their prompt, it's time for the players to duke it out.
        Players will recieve the prompt and are tasked with submitting a response.
        Just like the Judge, the limits of their response is their imagination (and the size of the response bar).
        Their goal is to submit "the best words" they can within the time limit in hopes of winning over the Judge.
      </p>
      <p className="text-start mb-3">
        Finally, all the players see everyone else's responses.
        The judge gets to select their favorite of the bunch and declare them the winner.
        To the winner goes the spoils, which in this case includes a point and the prestigious honor of being the judge for the next round.
        Play continues until one player aquires 3 points, in which case they are declared the victor.
      </p>
      <p className="text-center mb-3">
        This instructional image has been created to further your understanding.
      </p>
      
      <div id="picture" className="picture-box"><img width="800" className="img-fluid d-block mx-auto" src="boxing_instruction_meme.png" alt="A funny meme using a public domain painting" /></div>


    </main>

  );
}