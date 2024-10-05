const express = require("express");
const userRouter = require("./User");
const tourRouter = require("./Tour");
const cartRouter = require("./Cart");
const paymentRouter = require("./Payment");
const bookingRouter = require("./Booking");
function route(app) {
  app.use("/users", userRouter);
  app.use("/booking", bookingRouter);
  app.use("/tours", tourRouter);
  app.use("/carts", cartRouter);
  app.use("/payments", paymentRouter);
}

module.exports = route;
