const express = require("express");
const userRouter = require("./User");
const tourRouter = require("./Tour");
const cartRouter = require("./Cart");
function route(app) {
  app.use("/users", userRouter);
  app.use("/tours", tourRouter);
  app.use("/carts", cartRouter);
}

module.exports = route;
