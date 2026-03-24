const express = require('express');
const multer = require('multer');
const upload = multer();
const app = express();


app.post('/test', upload.none(), (req, res) => {
    console.log(JSON.stringify(req.body, null, 2));
    res.json(req.body);
});

app.listen(3333, () => console.log('test on 3333'));
