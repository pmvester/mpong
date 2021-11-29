const express = require('express')

express.static.mime.define({'application/javascript': ['js']});

const app = express();
app.use('/', express.static( __dirname ))

const port = 8080
app.listen(port, () => console.log('pong listening on port ' + port))
