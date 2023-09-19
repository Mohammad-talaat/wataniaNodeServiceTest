const json = require("body-parser/lib/types/json");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const odoo_xmlrpc = require("odoo-xmlrpc");
const xlsxFile = require("read-excel-file/node");
const dns = require("dns");

//secret key
const secret_key = "nour";

router.get("/", (req, res) => {
  res.send({
    message: "well done",
  });
});

router.get("/Fetch-server-time", async (req, res) => {
  res.send({
    time: new Date().toLocaleString("en-US", { timeZone: "Asia/Amman" }),
  });
});

router.get("/fetch-server-time-v2", async (req, res) => {
  res.send({
    time: Date.parse(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Amman" })
    ),
  });
});

router.post("/login", (req, res) => {
  //MOCK user
  const auth = {
    url: "http://192.168.0.2", //like 'http://207.154.195.214',
    port: 8069, // like 8060
    db: "wataniya", //req.body.db,
    username: "online",
    password: "ghp_WicoAKvrlFFHRScFcCZdX@srangy015KoOM",
  };
  // url: 'http://207.154.195.214',
  //     port: req.body.port,
  //     db: req.body.db,
  console.log("-------- auth ---------");
  console.log(auth);

  const odoo = new odoo_xmlrpc(auth);
  odoo.connect((err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      let user = {};

      odoo.execute_kw(
        "res.users",
        "search_read",
        [
          [
            [
              ["login", "=", req.body.username],
              ["password", "=", req.body.password],
            ],
          ],
          { fields: ["id"] },
        ],
        function (err, value) {
          if (err) {
            console.log(err);

            res.sendStatus(403);
          }
          console.log(value);
          user.id = value[0]["id"];
          jwt.sign({ auth }, secret_key, (err, token) => {
            res.json({
              token,
              user,
            });
          });
        }
      );
    }
  });
});

router.post("/call_method/:modelname/:method", verifyToken, (req, res) => {
  const modelname = req.params.modelname;
  const method = req.params.method;
  const list = req.body.paramlist;
  const resultList = Object.values(list);

  console.log(resultList, "lists");
  jwt.verify(req.token, secret_key, (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      delete authData.auth.id;
      const odoo = new odoo_xmlrpc(authData.auth);

      odoo.connect((err, response) => {
        if (err) return console.log("error", err);

        odoo.execute_kw(modelname, method, [resultList], function (err, value) {
          if (err) {
            return res.send(err);
          }
          res.json({
            data: value,
          });
        });
      });
    }
  });
});

router.get("/company_info/:name", (req, res) => {
  const map = {
    company_name: "company_name",
    host_url: "host_url",
    port: "port",
    db_name: "db_name",
  };
  xlsxFile("companies.xlsx", { map }).then(({ rows }) => {
    companyFounded = false;
    rows.forEach((element) => {
      if (element.company_name == req.params.name) {
        companyFounded = true;
        res.json({
          company_information: element,
        });
      }
    });
    if (!companyFounded) {
      res.json({
        company_information: false,
      });
    }
  });
});
function readfile() {}
//FORMAT OF TOKEN
//Authrization: Bearer <access_token>

//Verify Token
function verifyToken(req, res, next) {
  //Get auth header
  const bearerHeader = req.headers["authorization"];

  //Check if bearerToken is undefined
  if (typeof bearerHeader !== "undefined") {
    //split the space
    const bearer = bearerHeader.split(" ");

    //Get Token From Array
    const bearerToken = bearer[1];

    //Set The Token
    req.token = bearerToken;

    //Next Middleware
    next();
  } else {
    res.sendStatus(403);
  }
}

module.exports = router;
