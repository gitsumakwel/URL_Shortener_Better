const short = require('short-uuid');
const translator = short();
const shortid = () => {
  return translator.new();
};
//translate to short
const fromUUID = (uuid) => {
  return translator.fromUUID(uuid);
}

//translate to uuid
const toUUID = (shortid) => {
  return translator.toUUID(shortid);
}

module.exports = {
 shortid,
 translator,
 fromUUID,
 toUUID,
}
