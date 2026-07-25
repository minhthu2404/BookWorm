const express = require("express");
const cors = require("cors");
const app = express();
const usersRouter = require("./src/routes/user.route");
const authRouter = require("./src/routes/auth.route");
const bookRouter = require("./src/routes/book.route");
const requestRouter = require("./src/routes/request.route");
const ledgerRouter = require("./src/routes/ledger.route");

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/books", bookRouter);
app.use("/api/auth", authRouter);
app.use("/api/requests", requestRouter);
app.use("/api/ledgers", ledgerRouter);

module.exports = app;
