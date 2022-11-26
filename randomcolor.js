// random colour generator from material design colour file
const matColours = require("./matdes100colours.json");
let coloridx = Math.floor(Math.random() * matColours.colours.length) + 1;
console.log(matColours.colours[coloridx]);
