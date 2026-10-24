function registerRoutes(app) {
  app.get("/", (req, res) => {
    res.send("Skribbl backend is running!");
  });
}

module.exports = registerRoutes;
