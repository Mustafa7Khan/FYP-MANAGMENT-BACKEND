require("dotenv").config();

const express=require("express");

const authroutes=require("./routes/authroutes.js")
const dbconnect=require("./config/dbconnect.js");
const userroutes=require("./routes/userroutes");
dbconnect();
const app=express();



console.log(`process.env.GOOGLE_PRIVATE_KEY` + process.env.GOOGLE_CLIENT_EMAIL);
const cors = require("cors");
app.use(cors({ origin: "https://awkumtech.awkum.edu.pk/", credentials: true }));

//Midlleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Routes

app.use("/api/auth",authroutes);
app.use("/api/user",userroutes);
//Starting the server
const PORT=process.env.PORT || 8001;

app.listen(PORT,()=>{
    console.log(`Server running at port no. ${PORT}`);
})