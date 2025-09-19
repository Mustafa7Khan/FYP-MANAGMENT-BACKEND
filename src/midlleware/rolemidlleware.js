const authorizeRoles=(...allwedroles)=>{
return (req,res,next)=>{
    if(!allwedroles.includes(req.user.role)){
        console.log("Decoded User:", req.user);
       return res.status(403).json({message:`Access Denied`})
    }
next();
};
};
module.exports=authorizeRoles;