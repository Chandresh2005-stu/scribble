# Scribble — Real-Time Multiplayer Drawing & Guessing Game

A real-time multiplayer drawing and guessing game inspired by Skribbl.io. Players can create private rooms, invite friends, take turns drawing secret words, guess each other's drawings, and compete for points on a live leaderboard.

Built with **React, Vite, Node.js, Express, and Socket.IO**, this project demonstrates real-time communication, event-driven application design, multiplayer state management, and interactive frontend development.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How the Game Works](#how-the-game-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [How to Play](#how-to-play)
- [Game Rules](#game-rules)
- [Real-Time Architecture](#real-time-architecture)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)

## Overview

Scribble is a browser-based multiplayer game where players communicate through drawings and guesses rather than conventional gameplay controls.

Players can create a room, configure game settings, and share an invitation link or room code with friends. Once enough players have joined, the host starts the game. Players take turns drawing selected words while the other participants attempt to guess them before time runs out.

The application manages room membership, drawing synchronization, guessing, scoring, round progression, and game completion through real-time events.

### Key Highlights

- Real-time multiplayer interactions using Socket.IO.
- Room-based gameplay with invitation links and room codes.
- Configurable game settings and custom word categories.
- Synchronized drawing and live guessing.
- Score tracking, hints, timers, and leaderboard.
- Handling of player disconnections and host reassignment.
- Responsive user interface for different screen sizes.

## Features

### 1. Room Creation and Multiplayer Lobby

- Create a room with a player name.
- Join an existing room using its room code.
- Configure the maximum number of players.
- Choose the number of rounds.
- Configure the drawing duration.
- Share an invitation link with other players.
- View the room code, host, current players, and game settings.
- Display connection status and room capacity.
- Restrict starting the game until at least two players have joined.

### 2. Custom Word Categories

The host can select a word category when creating a room:

- **Mixed** — a mixture of drawing prompts.
- **Animals** — animal-related words.
- **Food** — food-related words.
- **Nature** — nature-related words.
- **Objects** — everyday objects and items.

The host can also provide custom words as a comma-separated list. Valid custom words are normalized, deduplicated, and added to the selected category's word pool.

Custom words are subject to input validation, including length restrictions and a maximum of 100 unique words.

### 3. Word Selection and Drawing

- The active drawer receives a selection of word choices.
- The selected word remains hidden from other players.
- Drawing is synchronized between players in real time.
- Players can use the drawing interface to illustrate the secret word.
- Drawing tools and drawing-related controls support interactive gameplay.

### 4. Guessing and Chat

- Players submit guesses during the active round.
- Correct guesses are recognized by the game server.
- Correct guesses award points according to the game's scoring logic.
- Incorrect guesses can be submitted while the round is active.
- Players can communicate through in-game chat.
- The game supports a configurable limit on incorrect guesses for the drawing player.

### 5. Timer, Hints, and Round Progression

- Each round has a configurable drawing timer.
- Hints help players identify the secret word.
- Round transitions are managed by the game server.
- The game advances when the round ends or when the relevant game-ending condition is reached.
- The final round leads to the game results.

### 6. Scoring and Results

- Player scores are tracked throughout the game.
- The leaderboard displays player rankings.
- Results are presented when the game finishes.
- Players can start another game using the Play Again flow.

### 7. Player and Room Lifecycle Management

- Players can leave a room.
- Disconnected players are removed from the room.
- Host responsibilities can be reassigned when the host leaves.
- The game handles drawer disconnections during a round.
- The game stops or advances when player disconnections leave too few participants.
- Room and game state are updated as players join, leave, or disconnect.

### 8. User Interface

- A landing page for creating or joining rooms.
- A lobby showing room details and player information.
- A dedicated gameplay interface.
- A connection status indicator.
- Invite-link copying.
- Responsive layouts and styled interface components.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Component-based frontend and UI state management |
| Vite | Frontend development server and build tooling |
| JavaScript | Application logic on the client and server |
| Node.js | Backend JavaScript runtime |
| Express | HTTP server framework |
| Socket.IO | Real-time, bidirectional client-server communication |
| CSS | Styling, layout, and responsive presentation |
| npm | Package and dependency management |

## How the Game Works

1. A player enters a name and creates a room.
2. The host configures the game settings, category, and optional custom words.
3. Other players join using the room code or invitation link.
4. The host starts the game when at least two players are present.
5. The active drawer selects a secret word.
6. The drawer illustrates the word while other players submit guesses.
7. The server validates guesses, updates scores, and manages the timer.
8. The game proceeds through the configured rounds.
9. The final results and leaderboard are displayed.

## Project Structure

The application is organized into separate frontend and backend directories.

```text
scribble/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ConnectionStatus.jsx
│       │   ├── PlayerList.jsx
│       │   └── RoomCode.jsx
│       ├── hooks/
│       │   └── useSocket.js
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Home.css
│       │   ├── Lobby.jsx
│       │   ├── Lobby.css
│       │   └── Game.jsx
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── handlers/
│   │   ├── gameHandlers.js
│   │   └── roomHandlers.js
│   ├── state/
│   │   └── rooms.js
│   └── utils/
│       └── words.js
├── README.md
└── .gitignore
```

*This is a representative structure based on the files used during development. Confirm the actual filenames and any additional files in your repository before submitting.*

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js (a version compatible with the project's dependencies).
- npm.
- Git, if cloning the repository.
- A modern web browser.

### 1. Clone the Repository

If the project is hosted in a Git repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd scribble
```

Alternatively, open your existing project directory in a terminal.

### 2. Install Dependencies

Install the frontend and backend dependencies separately if each directory has its own `package.json`.

```bash
cd client
npm install
```

Then install the backend dependencies:

```bash
cd ../server
npm install
```

### 3. Configure Environment Variables

Review the environment configuration section below. Set the backend port and frontend Socket.IO server URL if your application requires them.

### 4. Start the Backend

Open a terminal in the `server` directory and run the backend command defined in `server/package.json`.

For example, if the server defines a `start` script:

```bash
npm start
```

If it defines a different script, use that script instead.

### 5. Start the Frontend

Open a second terminal in the `client` directory:

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

Keep both development servers running while playing the game.

> **Before submission:** Replace the example startup instructions with the exact commands from the project's `package.json` files and verify that a fresh installation works.

## Environment Configuration

The frontend must connect to the running Socket.IO backend.

Check the following in the actual source code before documenting environment variables:

- **Backend port:** the port on which the Express/Socket.IO server listens.
- **Frontend server URL:** the URL used by the Socket.IO client to connect to the backend.
- **CORS configuration:** whether the backend permits connections from the frontend's development or deployment origin.

If the application uses environment variables, document their exact names in a table:

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | Backend, if configured | HTTP server port |
| `VITE_SERVER_URL` | Frontend, if configured | Socket.IO backend URL |

These names are examples, not a claim that both variables are already implemented. Confirm the actual variable names and defaults in the source code before using this table in the final submission.

Never commit private credentials, secrets, or production environment files.

## How to Play

1. Open the application.
2. Enter your player name.
3. Select the player limit, number of rounds, drawing time, and word category.
4. Optionally enter custom words separated by commas.
5. Select **Create a new room**.
6. Share the room code or invitation link with friends.
7. Wait until at least one other player joins.
8. The host selects **Start Game**.
9. Follow the word-selection prompt when it is your turn to draw.
10. Draw the secret word while the other players guess it.
11. Continue through the rounds and compare scores on the leaderboard.

## Game Rules

- Players take turns drawing and guessing.
- The active drawer illustrates the selected secret word.
- Other players attempt to guess the word before the round ends.
- Correct guesses are handled by the server and award points.
- Hints and the timer help manage the guessing round.
- The game progresses through the configured rounds and then presents the results.
- If players disconnect, the room and game lifecycle logic determines whether the game continues, advances, or stops.

Exact scoring values, hint timing, and disconnection thresholds depend on the implemented server logic.

## Real-Time Architecture

The application uses a client-server architecture.

### Frontend

The React frontend manages the landing page, room lobby, gameplay interface, and user interactions. A Socket