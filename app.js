var cors = require('cors');
const express = require('express');

const app = express();
app.use(express.json())
app.use(cors());
//Here we are configuring express to use body-parser as middle-ware.

//initialize
const port = 3000
app.use('/api', require('./routes/api'));
app.use('/watania', require('./routes/fetchPublicIP'));

//listen for requests
app.listen(process.env.port || port, () => console.log(`server start on port ${port}`))