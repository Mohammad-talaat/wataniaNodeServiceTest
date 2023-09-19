const express = require("express");
const router = express.Router();
const dns = require("dns");

router.get("/fetch-public-ip", (req, res) => {
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log(ip[0]);
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7);
    console.log(ip);
  }
  res.send({ ip });
});

router.get("/fetch-public-ip-v2", (req, res) => {
  console.log("------ test req ----------");
  console.log(req.headers);
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // If there are multiple IP addresses in x-forwarded-for, the first one is the original IP address
  if (ip.indexOf(",") > -1) {
    ip = ip.split(",")[0].trim();
  }

  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7);
  }
  res.send({ ip });
});

router.get("/fetch-public-ip-v3", (req, res) => {
  console.log("------ test req ----------");
  console.log(req.headers);
  let ip = req.headers["X-Forwarded-For"];
  let ip2 = req.connection.remoteAddress;
  console.log(req);
  console.log(ip2);
  console.log(req.ips);

  // If there are multiple IP addresses in x-forwarded-for, the first one is the original IP address
  res.send({ ip, ip2 });
});

router.get("/checkUserUsingDNS", (req, res) => {
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // If there are multiple IP addresses in x-forwarded-for, the first one is the original IP address
  if (ip.indexOf(",") > -1) {
    ip = ip.split(",")[0].trim();
  }

  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7);
  }
  dns.lookup("wic-fc-fortiddns.com", (err, address, family) => {
    console.log("address: %j family: IPv%s", address, family);
    if (address == ip) {
      return res
        .status(200)
        .json({ msg: "User is authenticated", value: true });
    } else if (address !== ip) {
      return res
        .status(401)
        .json({ msg: "User is unauthenticated", value: false });
    }
  });
  res.status(400).json({ msg: "Request Failed. Please try again!" });
});

router.get("/checkUserIPUsingIPs", (req, res) => {
  console.log(req.headers["x-forwarded-for"]);
  console.log(req.connection.remoteAddress);

  let publicIPs = [
    "105.37.128.108",
    "105.34.11.64",
    "162.158.22.204",
    "10.210.119.101",
    "105.37.247.174",
  ];

  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  // console.log(ip);

  // If x-forwarded-for has multiple IP addresses, it's a comma-separated string
  let ips = ip.split(",");

  // Trim whitespace from each IP address and remove IPv6 prefix
  ips = ips.map((ip) => ip.trim().replace(/^::ffff:/, ""));

  // Check if any of the IPs in the x-forwarded-for header is in publicIPs
  for (let ip of ips) {
    console.log(ip);
    // if (publicIPs.includes(ip)) {
    //     // The IP is in the list of public IPs
    //     return res.status(200).json({msg:'User is authenticated',value:true,ip});
    // }
    return res
      .status(200)
      .json({ msg: "User is authenticated", value: true, ip });
  }

  // No IP address was in the list of public IPs
  res.status(401).json({ msg: "User is unauthenticated", value: false });
});

router.post("/checkUserIPUsingIPs-v2", (req, res) => {
  // let publicIPs = ['105.37.128.108', '105.38.8.247','105.34.11.64', '102.42.183.76', '162.158.22.204', '10.210.119.101', '192.168.0.1','41.68.105.28','41.44.231.12','41.69.163.92','156.204.85.142'];
  let publicIPs = ["82.201.223.234", "82.201.223.233"];
  const { ip } = req.body;
  console.log(ip);

  if (publicIPs.includes(ip)) {
    // The IP is in the list of public IPs
    return res.status(200).json({ msg: "User is authenticated", value: true });
  }
  // No IP address was in the list of public IPs
  res.status(200).json({ msg: "User is unauthenticated", value: false });
});

module.exports = router;
