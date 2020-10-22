const express = require('express');
const app = express();
var cors = require('cors');
app.use(cors());

const port = 3000
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening at http://localhost:${port}`)
})