const express = require('express');
const app = express();
const cors  = require('cors');
const {MongoClient} = require('mongodb')
const { v4: uuidv4, validate: uuidValidate} = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config()

const uri = process.env.FINAL_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.urlencoded({extended:false}))
app.use(cors());
app.use(express.json())

// Authorization middleware
function authorize(role) {
    return (req, res, next) => {
        // Check the user's role from the session or token
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).send({
                status: "error",
                message: "Access forbidden"
            });
        }
    };
}
//token function
function createToken(role) {
    const secret = process.env.JWT_SECRET; // Retrieve the secret key from environment variables
    return jwt.sign({ role }, secret, { expiresIn: '1h' });
}



app.get('/testmongodb', async (req, res) => {
    try {
        await client.connect();

        const collection = client.db('expertlab2').collection('login');
        const users = await collection.find({}).project({ password: 0 }).toArray();


        res.status(200).send(users);
    } catch (e) {
        console.error(e);
        res.status(500).send({
            message: "Internal server error",
            error: e.message, // Add more details about the error
        });
    } finally {
            await client.close();
        
    }
});

app.post("/register", async (req,res) =>{

    if(!req.body.username || !req.body.email || !req.body.password){
        return res.status(401).send("Missing username/email/password")
    }

    try{
        await client.connect();
        const collection = client.db('expertlab2').collection('login');

        // Check if the email is already in use
        const existingUser = await collection.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).send({
                status: "error",
                message: "Email already in use"
            });
        }

        //create new user
        const user = {
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 10),
        role: 'user',
        uuid: uuidv4()

    }
    //add new user
        const insertedUsers = await collection.insertOne(user);

        res.status(201).send({
            status: "saved",
            id: insertedUsers.insertedId,
            data: user

        })
   
}
    catch(err){
        console.log(err)
    }finally{
        await client.close()
    }
})

app.post("/login", async (req,res) =>{

    if(!req.body.email || !req.body.password){
        return res.status(401).send("Missing username/password")
    }

    try{
        await client.connect();

        const loginuser = {
            email: req.body.email,
            password: req.body.password
        }

        const collection = client.db('expertlab2').collection('login');

        const query = {email: loginuser.email}
        const user = await collection.findOne(query);

        console.log("User found:", user);


        
        if(user){
            const passwordMatch = await bcrypt.compare(req.body.password, user.password);

            if(passwordMatch){
                const token = createToken(user.role);

                res.send({
                    status: "ok",
                    message: "User logged in successfully",
                    token: token,
                    role: user.role

                })
            }else{
                res.status(401).send({
                    status: "error",
                    message: "Invalid username/password"
                })
            }

            } 

    }

    catch (err) {
        console.error(err);
        res.status(500).send({
            status: "error",
            message: "Internal server error",
            error: err.message
        });
    }finally{
        await client.close()
    }
})



app.post("/verifyID", async (req, res) => {
    if (!req.body.uuid) {
        return res.status(401).send("Missing uuid");
    }

    try {
        await client.connect();

        const collection = client.db('expertlab2').collection('login');

        const query = { uuid: req.body.uuid };
        const user = await collection.findOne(query);

        if (user) {
            res.send({
                status: "ok",
                message: "Your uuid is valid",
                data: {
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid
                }
            });
        } else {
            res.status(401).send({
                status: "error",
                message: "Invalid uuid"
            });
        }
    } catch (err) {
        console.log(err);
    } finally {
        await client.close();
    }
});

app.get('/admin', (req, res, next) => {
    // Log the token from the request headers
    const token = req.headers.authorization;

    console.log('Token from Headers:', token);

    // Decode the token and attach user information to req.user
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('Decoded Token:', decoded);
    } catch (error) {
        console.error('Error Decoding Token:', error);
    }

    next(); // Continue to the authorization middleware
}, authorize('admin'), (req, res) => {
    res.send("Admin Dashboard");
});

app.post('/admin/editUser', authorize('admin'), async (req, res) => {
    const { uuid, username, email } = req.body;

    try {
        await client.connect();

        const collection = client.db('expertlab2').collection('login');

        // Find the user by UUID
        const query = { uuid };
        const existingUser = await collection.findOne(query);

        if (!existingUser) {
            return res.status(404).send({
                status: "error",
                message: "User not found"
            });
        }

        // Update the user with the new username and email
        const updateQuery = {
            $set: {
                username: username || existingUser.username,
                email: email || existingUser.email
            }
        };

        const result = await collection.updateOne(query, updateQuery);

        res.status(200).send({
            status: "ok",
            message: "User updated successfully",
            updatedUser: {
                username: username || existingUser.username,
                email: email || existingUser.email,
                uuid: existingUser.uuid
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            status: "error",
            message: "Internal server error",
            error: err.message
        });
    } finally {
        await client.close();
    }
});





app.listen(8000, () => {
    console.log('Server is listening on port 8000. Ready to accept requests!');
    }
);

