exports.commands = ["balance"];

let api;
let helper; 
let database;

exports.constructor = (api, helper) => {
    this.api = api;
    this.helper = helper;
    this.database = require("./database");
};

exports.balance = {

};