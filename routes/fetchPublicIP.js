const express = require('express');
const router = express.Router();
const dns = require('dns')

router.get('/fetch-public-ip', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
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
    let publicIPs = ['105.37.128.108',"105.34.11.64"];
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
    }
    console.log(ip)
    if (publicIPs.includes(ip)) {
        // The IP is in the list of public IPs
        res.status(200).json({msg:'User is authenticated',value:true});
    } else {
        // The IP is not in the list of public IPs
        res.status(401).json({msg:'User is unauthenticated',value:false});
    }
});




module.exports = router;
