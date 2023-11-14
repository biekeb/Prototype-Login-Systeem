const express = require('express');
const app = express();
const cors  = require('cors');

let users= [];

app.use(express.urlencoded({extended:false}))
app.use(cors());
app.use(express.json())



app.get('/', (req, res) => {
    res.send('Hello World');
    }
);

app.post("/register", (req,res) =>{

    if(!req.body.username || !req.body.email || !req.body.password){
        return res.status(401).send("Missing username/email/password")

    }

    users.push({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })

    console.log(users)

    res.send({
        status: "ok",
        message: "User registered successfully"
    })
})

app.post("/login", (req,res) =>{

    if(!req.body.email || !req.body.password){
        return res.status(401).send("Missing username/password")
    }

let user = users.find(element => element.email == req.body.email)

    if(user){
        if(
            user.password === req.body.password
        ){
            res.send({
                status: "ok",
                message: "User logged in successfully"
            })
        }else{
            res.status(401).send({
                status: "error",
                message: "Invalid username/password"
            })
        }

    } else{
        res.status(401).send({
            status: "error",
            message: "Invalid username/password"
        })
    }

})



app.listen(3000, () => {
    console.log('Server is listening on port 3000. Ready to accept requests!');
    }
);

