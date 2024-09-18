require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const path = require('path');
const session=require('express-session');
const app=express();
var DataTable = require( 'datatables.net' );
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

app.use(helmet({ contentSecurityPolicy: false })); // disable CSP
app.use(mongoSanitize());

const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const PORT=process.env.PORT || 3000;
try {
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log("Connected to MongoDB ♥");
    })
} catch (error) {
    console.log("An error is occured "+ error);
}
app.use(express.urlencoded({extended:false}));
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' })); // it will serve static files (e.g., CSS, JS) from disk and cache them in the client’s browser for a day

//to prvent ddos attack 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per window
    handler: (req, res) => {
      res.status(429).render('limit', {
        title: 'Rate Limit Exceeded',
        message: {
          type: 'warning',
          message: 'Too many requests. Please try again later.'
        }
      });
    }
  });
  

app.use(limiter);



app.use(session({
    secret:'Riphah',
    saveUninitialized:true,
    resave:false
}));


app.use((req,res,next)=>{
    res.locals.message=req.session.message;
    delete req.session.message;
    next();
})

app.set('view engine', 'ejs');


//route prrefix
app.use("",require('./routes/routes'))

app.use("/admin",require('./routes/admin_routes'))



app.get('/log_out', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin'); 
        }
        res.clearCookie('connect.sid');
        
        res.redirect('/log_in'); 
        });
});

app.use((req, res, next) => {
    res.status(404).render('404',{title:"404 Page not found"});
});


app.listen(PORT,()=>{
    console.log(`Server is running ♥ on http://localhost:${PORT} `);
})