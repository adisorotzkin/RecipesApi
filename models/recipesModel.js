const mongoose = require("mongoose");
const Joi = require("joi");

let recipeSchema = new mongoose.Schema(
{
    title:String,
    author:String,
    ingredients:Array,
    instructions:String,
    difficulty:String,
    prepTime:Number,
    cookTime:Number,
    servings:Number,
    imageUrl:String,
    date_created: 
    {
        type: Date, default: Date.now()
    },
    user_id:String
})
  
exports.RecipeModel = mongoose.model("recipes", recipeSchema);

exports.validateRecipe = (reqBody) =>
{
    let joiSchema = Joi.object(
    {
        title: Joi.string().min(2).max(50).required(),
        author: Joi.string().min(2).max(40).required(),
        ingredients: Joi.array().min(1).max(20).required(),
        instructions: Joi.string().min(2).max(200).required(),
        difficulty: Joi.string().min(2).max(20).required(),
        prepTime: Joi.number().min(1).max(999).required(),
        cookTime: Joi.number().min(1).max(999).required(),
        servings: Joi.number().min(1).max(9999).required(),
        imageUrl: Joi.string().allow(null, "").max(500)
    })
    return joiSchema.validate(reqBody);
}