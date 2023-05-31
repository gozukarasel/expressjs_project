const http = require(`http`);

const express = require('express');

const body_parser = require('body-parser');

const app = express();

const path = require('path');

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(body_parser.urlencoded({extended:false}));

app.use('/admin',adminRoutes); // order matters
app.use(shopRoutes);

app.use((req,res,next) =>{
    res.status(404).sendFile(path.join(__dirname,'./','views','not-found.html'));
});

app.listen(3000);
