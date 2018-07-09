import { Meteor } from 'meteor/meteor';
import { setupApi } from './imports/api/routes'; // import our API

if(Meteor.isServer) {
    // When Meteor starts, create new collection in Mongo if not exists.
    Meteor.startup(function () {
        Twets = new Meteor.Collection('tweets');
        setupApi()
    });
}