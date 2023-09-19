var cors = require("cors");
const express = require("express");

const app = express();
app.set("trust proxy", "loopback");
app.use(express.json());
app.use(cors());

//Here we are configuring express to use body-parser as middle-ware.

//initialize
const port = 4000;

app.use("/api", require("./routes/api"));
app.use("/attendance-ip", require("./routes/fetchPublicIP"));
app.use("/", (req, res) => {
  res.send(`server is working on port ${port}`);
});

//listen for requests
app.listen(process.env.port || port, () =>
  console.log(`server start on port ${port}`)
);
