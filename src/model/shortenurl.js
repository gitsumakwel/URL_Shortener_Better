let mongoose = require('mongoose')

const shortenurlSchema = new mongoose.Schema({
  originalurl: {type:String, required:true},
  shorturl: {type:String, required:true},  
  dateused: {type:Date, default:Date.now}
});
const ShortenURL = mongoose.model("urls",shortenurlSchema);

//save shortenrul object : {originalurl,shorturl}
const createAndSaveShortenURL = (shortenurl, done) => {  
  const s = new ShortenURL(shortenurl);
  s.save(function(err,result){
    if (err){}
    else{
      done(null,result);
    }
  });  
};

//get one document
const findShortenURL = async(toSearch, done) => {
  return await ShortenURL.findOne({shorturl:toSearch}).exec();  
}  

//get all 'toSearch' from originalurl
const getAll = async (toSearch, done) => {
  if (toSearch===null)await ShortenURL.find({originalurl:/[\w]*/g},'shorturl').exec()
  return await ShortenURL.find({originalurl:new RegExp(toSearch,'g')},'shorturl').exec();
}

//delete everything
const deleteAll = () => {  
  ShortenURL.collection.drop(done);
}

module.exports = {
  ShortenURL,
  createAndSaveShortenURL,
  findShortenURL,
  deleteAll,
  getAll,
}