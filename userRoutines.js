const matColours = require("./matdes100colours.json");
const moment = require("moment");

let users = [];

const addUser = usr => {
  return new Promise((resolve, reject) => {
    users.push({
      room: usr.room,
      name: usr.name,
      id: usr.id,
      color: usr.color
    });

    resolve(usr);
  });
};

const getUser = id => {
  return new Promise((resolve, reject) => {
    let usr = users.find(usr => usr.id == id);

    resolve(usr);
  });
};

const getAll = () => {
  return new Promise((resolve, reject) => {
    let usr = users;

    resolve(usr);
  });
};

const removeUser = id => {
  return new Promise((resolve, reject) => {
    users = users.filter(usr => usr.id !== id);

    resolve(id);
  });
};

const isNameUnique = name => {
  return new Promise((resolve, reject) => {
    let flag = true;

    try {
      users.map(usr => {
        if (usr.name === name) flag = false;
      });
    } catch (err) {
      console.log(`Server Error: ${err}`);
    }

    resolve(flag);
  });
};

const getTime = () => {
  return new Promise((resolve, reject) => {
    let time = moment().format("h:mm:ss a");
    resolve(time);
  });
};

const getColor = () => {
  return new Promise((resolve, reject) => {
    let color =
      matColours.colours[
        Math.floor(Math.random() * matColours.colours.length) + 1
      ];
    resolve(color);
  });
};
module.exports = {
  addUser,
  getUser,
  removeUser,
  getColor,
  isNameUnique,
  getTime,
  getAll
};
