const express = require('express');
const bodyParser = require('body-parser');
const admin =require('firebase-admin');
const session = require('express-session');
const path= require('path');
const request = require('request'); 
const app= express();

const PORT= 3002;

const serviceAccount=require('./key2.json');

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount)
});

const db =admin.firestore();

app.set('view engine','ejs');

app.use(session({
    secret:'thisissecret',
    resave:false,
    saveUninitialized:false,
    cookie:{ secure: false }
}));

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.render('dashboard');
});

app.get('/signup',(req,res)=>{
    res.render('signup');
});

app.post('/signup',async(req,res)=>{
    const { email, password }=req.body;
    await db.collection('details').doc(email).set({
        email,
        password
    });
    res.render('login');
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('/login',async(req,res)=>{
    const { email, password }=req.body;
    const userDoc = await db.collection('details').doc(email).get();
    if(!userDoc.exists || userDoc.data().password!== password){
        return res.status(400).send('Invalid Email or password');
    }
    res.render('home');
});
app.get('/weather', (req, res) => {
    const city = req.query.city || 'london'; // Default to London if no city is provided
    request.get({
        url: 'https://api.api-ninjas.com/v1/weather?city=' + city,
        headers: {
            'X-Api-Key': '40CVo4XO0Vv2UaEB07GbLQ==MutSHqMfEojE0GP9'
        },
    }, function(error, response, body) {
        if (error) {
            console.error('Request failed:', error);
            res.status(500).json({ error: 'Request failed' });
        } else if (response.statusCode != 200) {
            console.error('Error:', response.statusCode, body.toString('utf8'));
            res.status(response.statusCode).send(body.toString('utf8'));
        } else {
            const weatherData = JSON.parse(body);
            res.json(weatherData); // Send weather data as JSON response

        }
    });
});

app.listen(PORT,()=>{
    console.log(`Listening Port http://localhost:${PORT}`);
});