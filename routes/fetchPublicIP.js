const express = require('express');
const router = express.Router();
const dns = require('dns')

router.get('/fetch-public-ip', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip[0])
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
        console.log(ip)
    }
        res.send({ip});
});

router.get('/fetch-public-ip-v2', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // If there are multiple IP addresses in x-forwarded-for, the first one is the original IP address
    if (ip.indexOf(',') > -1) {
        ip = ip.split(',')[0].trim();
    }

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    res.send({ip});
});


router.get('/checkUserUsingDNS',(req,res)=>{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }
    dns.lookup('wic-fc-fortiddns.com', (err, address, family) => {
        console.log('address: %j family: IPv%s', address, family);
        if(address == ip){
            return res.status(200).json({msg:'User is authenticated',value:true})
        }
        else if(address !== ip){
            return res.status(401).json({msg:'User is unauthenticated',value:false})
        }
    });
    res.status(400).json({msg:'Request Failed. Please try again!'});
})


router.get('/checkUserIPUsingIPs', (req, res) => {
    let publicIPs = ['105.37.128.108', '105.34.11.64', '162.158.22.204', '10.210.119.101',"105.194.75.206"];
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // If x-forwarded-for has multiple IP addresses, it's a comma-separated string
    let ips = ip.split(',');

    // Trim whitespace from each IP address
    ips = ips.map(ip => ip.trim());

    // Check if any of the IPs in the x-forwarded-for header is in publicIPs
    for(let ip of ips) {
        if (publicIPs.includes(ip)) {
            // The IP is in the list of public IPs
            return res.status(200).json({msg:'User is authenticated',value:true,ip});
        }
    }

    // No IP address was in the list of public IPs
    res.status(401).json({msg:'User is unauthenticated',value:false});
});





module.exports = router;
