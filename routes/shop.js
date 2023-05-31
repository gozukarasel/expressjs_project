const express = require('express');

const router = express.Router();

const path = require('path');

router.get('/',(req,res,next) =>
{
    console.log("deneme");
    res.sendFile(path.join(__dirmame,'../','views','shop.html'));
}
)

module.exports = router;