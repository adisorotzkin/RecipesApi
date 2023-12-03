const express= require("express");
const {auth} = require("../middlewares/auth");
const {RecipeModel,validateRecipe} = require("../models/recipesModel")
const router = express.Router();

//Get all recipes, presenting 10 results per page.
router.get("/",async(req,res) => 
{
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
      try
      {
        let data = await RecipeModel.find({})
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
 //Get a recipe by id.
 router.get("/single/:idRecipe" , async(req,res)=> 
 {
  try
  {
    let idRecipe = req.params.idRecipe
    let data = await RecipeModel.findOne({_id:idRecipe})
    res.json(data);
  }
  catch(err)
  {
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})
//search a recipe follwing title or difficulty ,presenting 10 results per page.
router.get("/search" ,async(req,res) => 
{
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    try
    {
        let queryS = req.query.s;
        let searchReg = new RegExp(queryS,"i")
        let data = await RecipeModel.find({$or:[{title:searchReg},{difficulty:searchReg}]})
        .limit(perPage)
        .skip((page - 1) * perPage)
        res.json(data);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({msg:"there error try again later",err})
    }
})
//Get recipes by prepTime- min,max , presenting 10 results per page.
router.get("/prepTime" ,async(req,res)=> 
{
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "prepTime";
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try
    {
      let min = req.query.min;
      let max = req.query.max;
      if(min && max)
      {
        let data = await RecipeModel.find({$and:[{prepTime:{$gte:min}},{prepTime:{$lte:max}}]})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }
      else if(max)
      {
        let data = await RecipeModel.find({prepTime:{$lte:max}})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }else if(min)
      {
        let data = await RecipeModel.find({prepTime:{$gte:min}})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }else
      {
        let data = await RecipeModel.find({})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }
    }
    catch(err)
    {
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})
//Get recipes by cookTime- min,max , presenting 10 results per page.
router.get("/cookTime" ,async(req,res)=> 
{
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "cookTime";
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try
    {
      let min = req.query.min;
      let max = req.query.max;
      if(min && max)
      {
        let data = await RecipeModel.find({$and:[{cookTime:{$gte:min}},{cookTime:{$lte:max}}]})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }
      else if(max)
      {
        let data = await RecipeModel.find({cookTime:{$lte:max}})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }else if(min)
      {
        let data = await RecipeModel.find({cookTime:{$gte:min}})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }else
      {
        let data = await RecipeModel.find({})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }
    }
    catch(err)
    {
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})
//Get recipes by servings- min, presenting 10 results per page.
router.get("/servings" ,async(req,res)=> 
{
    let perPage = req.query.perPage || 10;
    let page = req.query.page || 1;
    let sort = req.query.sort || "servings";
    let reverse = req.query.reverse == "yes" ? -1 : 1;
    try
    {
      let min = req.query.min;
      if(min)
      {
        let data = await RecipeModel.find({servings:{$gte:min}})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }else
      {
        let data = await RecipeModel.find({})
        .limit(perPage)
        .skip((page - 1)*perPage)
        .sort({[sort]:reverse})
        res.json(data);
      }
    }
    catch(err)
    {
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})
//adding new recipe with token
router.post("/", auth, async(req,res) => 
{
    let validBody = validateRecipe(req.body);
    if(validBody.error)
    {
      return res.status(400).json(validBody.error.details);
    }
    try
    {
      let recipe = new RecipeModel(req.body);
      recipe.user_id = req.tokenData._id;
      await recipe.save();
      res.status(201).json(recipe);
    }
    catch(err)
    {
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})
//edit recipe by his user or admin
router.put("/:idEdit", auth, async(req,res) => 
{
    let validBody = validateRecipe(req.body);
    if(validBody.error)
    {
      return res.status(400).json(validBody.error.details);
    }
    try
    {
      let idEdit = req.params.idEdit;
      let data;
      if(req.tokenData.role == "admin")
      {
        data = await RecipeModel.updateOne({_id:idEdit},req.body)
      }
      else
      {
         data = await RecipeModel.updateOne({_id:idEdit,user_id:req.tokenData._id},req.body)
      }
      res.json(data);
    }
    catch(err)
    {
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})
//delete recipe by his user or admin
router.delete("/:idDel", auth, async(req,res) => 
{
    try
    {
      let idDel = req.params.idDel;
      let data;
      if(req.tokenData.role == "admin")
      {
        data = await RecipeModel.deleteOne({_id:idDel})
      }
      else
      {
        data = await RecipeModel.deleteOne({_id:idDel,user_id:req.tokenData._id})
      }
      res.json(data);
    }
    catch(err)
    {
      console.log(err);
      res.status(500).json({msg:"there error try again later",err})
    }
})




 module.exports = router;