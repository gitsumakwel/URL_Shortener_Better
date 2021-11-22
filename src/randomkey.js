let CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890+-*.@$^=';

const randomNumbers = (length,container) => {  
  if (length < 1)return container;
  container = randomNumbers(length-1, container);
  container.push(Math.floor(Math.random() * CHARACTERS.length)+1)
  return container;
}

const randomkey = (length) => {
    //array of random numbers
    let randChars = [];
    randChars = randomNumbers(length,randChars);
    randChars = randChars.map(index => CHARACTERS[index]);
    return randChars;
};

//console.log(CHARACTERS.length)
//console.log(Math.pow(3,CHARACTERS.length))
module.exports = {
  randomkey,
}