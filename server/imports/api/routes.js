import {Meteor} from 'meteor/meteor';

require = __meteor_bootstrap__.require; //to use npm require must be exposed.
import express from 'express';
import Twit from 'twit';

let twit = new Twit({
    consumer_key: 'tqgojehehR4uwMAtC6vyNmYyN',
    consumer_secret: 'A4RZGalAe9z0sgsAGzznqLs7ti3DMet0jqtYbgHBMXJouQwXiU',
    access_token: '256735487-XM7pR1cmXZ5MX7XLdIQrGbYgOxaHSZL4Ju7bUaOZ',
    access_token_secret: 'z3F9SDhU8qRf6rdQI1Gw7NJzTKMHFjm8wsBp4FWXHZjNM',
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL: true,     // optional - requires SSL certificates to be valid.
});
let getTwitTweets = function (user, count, max_id = "") {
    return new Promise((resolve, reject) => {
        let options = {
            screen_name: user,
            count: count
        };
        (max_id !== "") ? options.max_id = max_id : false;
        twit.get('statuses/user_timeline', options, function (err, data, response) {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(data)
            }
        })
    })
};
let getTwitUser = function (user) {
    return new Promise((resolve, reject) => {
        let options = {
            screen_name: user
        };
        twit.get('users/show', options, function (err, data, response) {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(data)
            }
        })
    })
};
let insertTwets = function (tweetsRecived, user) {
    return new Promise(((resolve, reject) => {
        getTwitUser(user)
            .then((userProfile) => {
                let userSummary = {
                    statusCount: userProfile.statuses_count,
                    lists: userProfile.listed_count,
                    followers: userProfile.followers_count,
                    favorites: userProfile.favourites_count,
                    reTweets_count: userProfile.retweet_count
                };
                let tweets = tweetsRecived.map((tweetRecived)=>{
                    return {
                        tweet_text :tweetRecived.text,
                        username :tweetRecived.user.name,
                        id :tweetRecived.id_str,
                        date : tweetRecived.created_at
                    }
                });
                let profileData = {
                    userName:user,
                    name:userProfile.name,
                    location:userProfile.location,
                    description: userProfile.description,
                    profile_image: userProfile.profile_image_url_https,
                    createdAt: userProfile.created_at
                };
                summary = {
                    userSummary,
                    tweets,
                    profileData,
                };
                Twets.insert(summary);
                resolve(summary);
            })
            .catch((err) => {
                return reject(err);
            });

    }))
};

export function setupApi() {
    const app = express();
    app.get('/getTweets', (req, res) => {
        if (req.query.twiterUser) {
            let user = req.query.twiterUser.trim();
            let count = (req.query.getNumber) ? req.query.getNumber : 50;
            let max = (req.query.maxDate) ? req.query.maxDate : false;
            let since = (req.query.sinceDate) ? req.query.sinceDate : false;

            getTwitTweets(user, count)
                .then((tmpTweets) => {
                    let tweets = tmpTweets.filter((tweet) => {
                        if (max && since) {
                            if (new Date(tweet.created_at) < max && new Date(tweet.created_at) > since) {
                                return tweet;
                            }
                        }
                        else {
                            return tweet;
                        }
                    });
                    if (tweets.length < count) {
                        getTwitTweets(user, count - tweets.length, tweets[tweets.length - 1].id_str)
                            .then((restTweets) => {
                                insertTwets(tweets.concat(restTweets),user)
                                    .then((sumaryInserted) => {
                                        res.status(200).json({obj: sumaryInserted, message: 'findSuccess'});
                                    })
                            })
                            .catch((err) => {
                                res.status(500).json({err: err, message: 'findFailure'});
                            });
                    }
                    else {
                        insertTwets(tweets,user)
                            .then((sumaryInserted) => {
                                res.status(200).json({obj: sumaryInserted, message: 'findSuccess'});
                            })
                    }
                })
                .catch((err) => {
                    res.status(500).json({err: err, message: 'findFailure'});
                });
        }
        else {
            res.status(500).json({err: {message: 'user required'}, message: 'user required'});
        }

    });
    app.get('/getSummary', (req, res) => {
        let response;
        let user = req.query.username.trim();
        let data = Twets.find({"profileData.userName":user}).fetch();
        if (data.length > 0) {
            response = data;
            res.status(200).json({obj: response, message: 'User Found'});
        }
        else {
            response = {
                "error": true,
                "message": "That user isn't in db"
            };
            res.status(200).json({obj: response, message: "That user isn't in db"});
        }
    });

    WebApp.connectHandlers.use(app);
}
