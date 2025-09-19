const express=require("express");
const authorizeRoles =require("../midlleware/rolemidlleware");
const verifyToken=require("../midlleware/authmidllleware");
const router=express.Router();

//admin

router.get("/admin",verifyToken,authorizeRoles("admin"),(req,res)=>{
res.json({messge:`Welcome admin`})
})


//admin and faculty
router.get("/faculty",verifyToken,authorizeRoles("admin","faculty",),(req,res)=>{
    res.json({messge:`Welcome faculty`})
    })
// --- Only this one route! ---

//admin teacher and students
router.get("/student",verifyToken,authorizeRoles("admin","faculty","student"),(req,res)=>{
    res.json({messge:`Welcome student`})
    })

    module.exports = router;
