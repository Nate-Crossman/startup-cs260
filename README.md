# Project Name: T.I.E.W.O.W (The Intense Epic War of Words)

[My Notes](notes.md)

TIEWOW is a Quiplash-inspired party game where players defeat their closest friends through the power of choosing "the best words" in response to a prompt of their own design.

> [!NOTE]
> This is a template for your startup application. You must modify this `README.md` file for each phase of your development. You only need to fill in the section for each deliverable when that deliverable is submitted in Canvas. Without completing the section for a deliverable, the TA will not know what to look for when grading your submission. Feel free to add additional information to each deliverable description, but make sure you at least have the list of rubric items and a description of what you did for each item.

> [!NOTE]
> If you are not familiar with Markdown then you should review the [documentation](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) before continuing.

### Elevator pitch

My application would allow users to create lobbies with various other users. Once in the lobby, a user can be selected or predetermined as the judge who expresses a prompt. The application would then ask other users that prompt and allow people to compare and vote for their favorite of the responses. It would be played in a manner similar to the party game 'Quiplash', but could also be used in other contexts, like education or as an icebreaker.

### Design

![Design image](startup_design.png)

### Key features

- Login Feature
- Create and Join Private Lobbies
- Third Party API can be used to help with example prompts or responses
- Prompt creation where a player can create a question for others to answer
- Voting period where players vote for the best prompt
- Point system to keep track of the player with the most votes

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - Base framework of login page, private lobby pages, and 
- **CSS** - Create a fun design around the page to keep it visually interesting and have a party game aesthetic, but ensure readability is maintained for the best user experience.
- **React** - Use react to make the webpage interactable, such as buttons for submitting and joining a game.
- **Service** - Backend to process things like login data, lobbies, prompts, and votes. Third Party API's, such as [this fact generator](https://uselessfacts.jsph.pl/) will be implemented to hopefully inspire someone to come up with a prompt or response if they can't think of anything.
- **DB/Login** - Store login information, users, lobbies.
- **WebSocket** - Allow players to see the votes of other players for prompts, hopefully in real time.

## 🚀 Specification Deliverable

> [!NOTE]
> Fill in this sections as the submission artifact for this deliverable. You can refer to this [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] I completed the prerequisites for this deliverable (Git commit requirement)
- [X] Proper use of Markdown
- [X] A concise and compelling elevator pitch
- [X] Description of key features
- [X] Description of how you will use each technology including your 3rd party API and use of WebSocket
- [X] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Rented EC2 server** - I rented my own EC2 server using AWS. I have successfully 'ssh'ed into the server with my .pem key. I have assigned my server it's own elastic IP address.
- [X] **Leased domain name** - I have leased and connected a domain name for my website.
- [X] **Server accessible** from my domain: [http://natethecrate.click](http://natethecrate.click)

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [X] **HTML pages** - I created four HTML pages to represent my page. I have Index, Play, Games, and How-to-play.
- [X] **Proper HTML element usage** - I sure hope it was proper. The home one is named index.
- [X] **Links** - Each HTML page has a link to the others in a nav bar.
- [X] **Text** - I did not complete this part of the deliverable.
- [] **3rd party API placeholder** - Lowkey I forgot to include this but I added it during the CSS step.
- [X] **Images** - I created my own image to add to the rules page using an old painting recently added to the public domain.
- [X] **Login placeholder** - The index.html file has a placeholder for the login.
- [X] **DB data placeholder** - The game.html file has a placeholder for the games database.
- [X] **WebSocket placeholder** - The play.html file has spaces where Websockets would allow real time input, so players can see other's prompts and responses in near-immediate time.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [X] **Visually appealing colors and layout. No overflowing elements.** - I made my page a pleasant color with a cohesive theme and flowing layout.
- [X] **Use of a CSS framework** - I utilized bootstrap extensively to make my page more readable and reactive.
- [X] **All visual elements styled using CSS** - I used CSS and Bootstrap to give my elements their own style.
- [X] **Responsive to window resizing using flexbox and/or grid display** - I used flex to make several elements change and shrink as needed to fit the viewing experience.
- [X] **Use of a imported font** - I imported two fonts from Google Fonts to give my page a unique feel
- [X] **Use of different types of selectors including element, class, ID, and pseudo selectors** - I used many different types of selectors to seperately style different elements of my page.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Bundled using Vite** - I did not complete this part of the deliverable.
- [ ] **Components** - I did not complete this part of the deliverable.
- [ ] **Router** - I did not complete this part of the deliverable.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.
- [ ] **Supports registration, login, logout, and restricted endpoint** - I did not complete this part of the deliverable.
- [ ] **Uses BCrypt to hash passwords** - I did not complete this part of the deliverable.

## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
