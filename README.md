Scribble --- Real-Time Multiplayer Drawing & Guessing Game
A browser-based multiplayer drawing and guessing game inspired by
Skribbl.io. Create a room, invite friends, take turns drawing secret
words, and compete for points on a live leaderboard.
Live Demo
- Play the game: https://scribble-roan-beta.vercel.app/
- GitHub repository: https://github.com/Chandresh2005-stu/scribble
Features
- Create and join multiplayer rooms using room codes or invitation
  links.
- Real-time drawing synchronized between players using Socket.IO.
- Guess words and earn points for correct answers.
- In-game guessing and general chat.
- Round timer, hints, and automatic round progression.
- Configurable player limit, number of rounds, and drawing duration.
- Word categories: Mixed, Animals, Food, Nature, and Objects.
- Optional custom words.
- Wrong-guess limit and score tracking.
- Live leaderboard and final game results.
- Host controls, room lifecycle handling, and host reassignment when
  needed.
- Responsive interface for desktop and smaller screens.
Tech Stack
  Technology   Purpose
  React        Frontend UI and state management
  Vite         Frontend development server and build tooling
  JavaScript   Application logic
  Node.js      Backend runtime
  Express      HTTP server
  Socket.IO    Real-time, bidirectional communication
  CSS          Styling and responsive layout
  Vercel       Frontend deployment
  Render       Backend deployment
How the Game Works
1. Create a room and configure its settings.
2. Share the room code or invitation link with other players.
3. The host starts the game once at least two players are present.
4. The active drawer selects a secret word.
5. The drawer illustrates the word while other players submit guesses.
6. The server validates guesses, updates scores, and manages round
   progression.
7. The game continues through the configured rounds and then displays
   the results.
Project Structure
scribble/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/
│       │   └── game/       # Gameplay components
│       ├── pages/          # Home, lobby, and game pages
│       └── services/       # Socket.IO client setup
├── server/                 # Node.js + Express + Socket.IO backend
│   └── src/
│       ├── config/         # Socket.IO configuration
│       ├── handlers/       # Room, drawing, and game events
│       ├── state/          # Room and game state
│       └── utils/          # Word data and utilities
└── README.md
Run Locally
Prerequisites
- Node.js and npm
- Git
1. Clone the repository
git clone https://github.com/Chandresh2005-stu/scribble.git
cd scribble
2. Configure and start the backend
Create server/.env with:
CLIENT_URL=http://localhost:5173
Then open a terminal and run:
cd server
npm install
npm start
The backend uses port 3000 by default, unless the hosting environment
provides a PORT value.
3. Configure and start the frontend
Open a second terminal from the project root and run:
cd client
npm install
Create client/.env with:
VITE_SERVER_URL=http://localhost:3000
Start Vite:
npm run dev
Open the local URL printed by Vite, usually http://localhost:5173.

Keep both terminals running while playing locally. If you change an
environment variable, restart the relevant development server.
Deployment Configuration
The frontend and backend are deployed separately.
Frontend --- Vercel
Set this environment variable in the Vercel project:
VITE_SERVER_URL=https://scribble-server-by5m.onrender.com
Backend --- Render
Set this environment variable in the Render service:
CLIENT_URL=https://scribble-roan-beta.vercel.app
The backend should listen on process.env.PORT when supplied by the
hosting platform, with a local fallback port.

Security note: Do not commit .env files, credentials, or private
secrets to GitHub. Configure production environment variables through
Vercel and Render.
How to Play
1. Open the live demo.
2. Enter a player name and create a room, or join an existing room.
3. Configure game settings when creating a room.
4. Share the room code or invitation link with friends.
5. The host starts the game once another player has joined.
6. Draw the selected word when it is your turn; otherwise, guess the
   drawing.
7. Earn points for correct guesses and compare scores on the
   leaderboard.
Real-Time Architecture
The React frontend connects to the Node.js backend through Socket.IO.
The backend handles room membership, drawing events, guesses, scoring,
timers, and round progression, then broadcasts relevant updates to
players in the room. The frontend uses the Vercel deployment, while the
Socket.IO backend runs on Render.
Future Improvements
- Add automated tests for room lifecycle and gameplay events.
- Improve accessibility and keyboard navigation.
- Add additional word packs and optional game settings.
- Refine success and error feedback animations.