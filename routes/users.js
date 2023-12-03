const express= require("express");
const bcrypt = require("bcrypt");
const {auth, authAdmin} = require("../middlewares/auth");
const {UserModel,validUser, validLogin,createToken} = require("../models/usersModel")
const router = express.Router();


//Get list of all users - by token admin.
router.get("/usersList" ,authAdmin, async(req,res)=> 
{
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
  
    try
    {
      let data = await UserModel.find({},{ password: 0 })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({_id:-1})
       res.json(data);
    }
    catch(err)
    {
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})
//user's information based on the token they send
router.get("/myInfo",auth,async (req, res) => 
{
  try 
  {
    let info = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(info);
  }
  catch (err) 
  {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})
//adding new user
router.post("/", async(req,res) => {
    let validBody = validUser(req.body);
    if(validBody.error)
    {
      return res.status(400).json(validBody.error.details);
    }
    try
    {
      let user = new UserModel(req.body);
      user.password = await bcrypt.hash(user.password, 10);
      await user.save();
      user.password = "***";
      res.status(201).json(user);
    }
    catch(err)
    {
      if(err.code == 11000)
      {
        return res.status(500).json({msg:"Email already in system, try log in",code:11000})
      }
      console.log(err);
      res.status(500).json({msg:"err",err})
    }
})
//user login
router.post("/login", async(req,res) => 
{
    let validBody = validLogin(req.body);
    if(validBody.error)
    {
      return res.status(400).json(validBody.error.details);
    }
    try
    {
      let user = await UserModel.findOne({email:req.body.email})
      if(!user)
      {
        return res.status(401).json({msg:"email is worng"})
      }
      let authPassword = await bcrypt.compare(req.body.password,user.password);
      if(!authPassword)
      {
        return res.status(401).json({msg:"Password or email is worng"});
      }
      let token = createToken(user._id, user.role);
      res.json({token});
    }
    catch(err)
    {
      console.log(err)
      res.status(500).json({msg:"err",err})
    }
})
//edit user by this user or admin
router.put("/:idEdit",auth, async (req, res) => 
{
  let validBody = validUser(req.body);
  if (validBody.error) 
  {
    return res.status(400).json(validBody.error.details);
  }
  try 
  {
    let idEdit = req.params.idEdit;
    let data;
    if (req.tokenData.role === "admin") 
    {
      data = await UserModel.updateOne({ _id: idEdit }, req.body)
    }
    else if (idEdit === req.tokenData._id) 
    {
      data = await UserModel.updateOne({ _id: idEdit }, req.body)
    }
    if (!data) 
    {
      return res.status(400).json({ err: "This operation is not enabled or this token is not match to idEdit!" })
    }
    let user = await UserModel.findOne({ _id: idEdit });
    user.password = await bcrypt.hash(user.password, 10);
    await user.save()
    res.status(200).json({ msg: data })
  }
  catch (err) 
  {
    console.log(err);
    res.status(400).json({ err })
  }
});
//delit user by this user or admin
router.delete("/:idDel" ,auth,async (req, res) => 
{
  try {
    let idDel = req.params.idDel;
    let data;
    // delete user
    if (req.tokenData.role == "admin") {
      data = await UserModel.deleteOne({ _id: idDel });
    }
    else if (idDel == req.tokenData._id) {
      data = await UserModel.deleteOne({ _id: idDel });
    }
    // await ToyModel.deleteMany({ user_id: idDel });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ err })
  }
});

module.exports = router;