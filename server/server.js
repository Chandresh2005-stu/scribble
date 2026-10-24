
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const registerRoutes = require("./src/routes");
const initializeSocket = require("./src/config/socket");

const app = express();

app.use(cors());
app.use(express.json());

registerRoutes(app);

const httpServer = createServer(app);

initializeSocket(httpServer);

// Use Render's assigned port in production and port 3000 locally.
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
