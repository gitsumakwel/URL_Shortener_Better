const short = require('short-uuid');
const translator = short();
const shortid = (id) => {
  return translator.new();
};
//translate to short
//translator.fromUUID(uuid);

//translate to uuid
//translator.toUUID(shortid);

module.exports = {
 shortid,
 translator
}
