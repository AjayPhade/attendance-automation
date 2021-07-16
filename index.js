const express = require("express");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');

const app = express();

//Used to access static files from public folder
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

const admin = require("firebase-admin");
const { response } = require("express");

// const serviceAccount = require("d:/attendance-automation-ds-firebase-adminsdk-ct6f0-692899d849.json");

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT)),
    databaseURL: process.env.DATABASE_URL
});

const database = admin.database().ref();
const users = database.child('users');

function submitForm(formLink, uniqueID, time, res) {
    const formID = formLink.split('/')[6];

    const formURL = 'https://docs.google.com/forms/d/e/' + formID + '/formResponse';

    console.log(formURL);

    users.get().then(snapshot => {
        if (snapshot.exists()) {
            var data = snapshot.val()[uniqueID];

            console.log(data);

            if (data === undefined) {
                console.log('No Data Available for ' + uniqueID);
                res.send('No Data Available for ' + uniqueID + '<br>Upload the data first');
            } else {
                const date = getDate();

                if (data.lastSubmit === date) {
                    console.log(uniqueID + ' tried to send the form again in single day');
                    res.send('You already have given attendance today');
                    return;
                }

                data = convertData(data, date, time);

                console.log(data);

                var params = new URLSearchParams(data);

                var options = { method: 'POST', body: params };

                fetch(formURL, options).then(response => {
                    if (response.ok) { // res.status >= 200 && res.status < 300
                        console.log('Done');
                        response.text().then(text => res.send(text));

                        users.child(uniqueID).update({ lastSubmit: date }, err => {
                            if (err) {
                                console.error(err);
                                throw new Error();
                            } else {
                                console.log('Last date updated successfully');
                            }
                        });
                    } else {
                        console.log(response.statusText);
                        res.send(response.statusText);
                    }
                });
            }
        } else {
            console.log('No Data Available');
            res.send('No Data Available');
        }
    }).catch(err => {
        console.error(err);
        res.send(err)
    });
}

function uploadData(uniqueID, data, res) {
    users.child(uniqueID).get().then(snapshot => {
        if (snapshot.exists()) {
            console.log('Data already available');
            res.send('Data already available');
        } else {
            data.lastSubmit = '';

            users.child(uniqueID).set(data, err => {
                if (err) {
                    console.error(err);
                    res.send(err);
                } else {
                    console.log('Data uploaded successfully');
                    res.send(`Data uploaded successfully
                            <br>Your Unique ID: ${uniqueID}`);
                }
            });
        }
    }).catch(err => {
        console.error(err);
        res.send(err);
    });
}

function generateID(_class, rollNo) {
    switch (_class) {
        case 'TY CSE A':
            return 't' + rollNo;

        case 'BE CSE A':
            return 'ba' + rollNo;

        case 'BE CSE B':
            return 'bb' + rollNo;

        case 'SY BTech A':
            return 's' + rollNo;
    }
}

function getDate() {
    var date = new Date();

    console.log('UTC/GMT:', date);

    const year = new Intl.DateTimeFormat('en-in', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
    }).format(date);

    const month = new Intl.DateTimeFormat('en-in', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit'
    }).format(date);

    const day = new Intl.DateTimeFormat('en-in', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit'
    }).format(date);

    date = year + '-' + month + '-' + day;

    console.log(date);

    return date;
}

function convertData(data, date, time) {
    const entry = {
        'entry.669753067': data.rollNo,
        'entry.679409453': data.subject,
        'entry.1485670224': data.fullName,
        'entry.1501085151': data._class,
        'entry.1644672609': data.email,
        'entry.1718818963': data.mobile,
        'entry.1395348466': date,
        'entry.1313054489': time,
        emailAddress: data.email,
    };

    return entry;
}

app.get('/', (req, res) => {
    // res.render('index.html');
});

app.get('/lol', (req, res) => {
    console.log('lol');
    console.log(req.query);

    const formLink = req.query.formLink;
    const uniqueID = req.query.uniqueID;
    const time = req.query.time;

    submitForm(formLink, uniqueID, time, res);

    // res.sendFile(__dirname + '/public/index.html');
});

app.get('/upload', (req, res) => {
    // console.log(req.query);

    const data = req.query;
    const _class = data._class;
    const rollNo = data.rollNo;

    console.log(_class, rollNo);

    // To avoid redundancy in the database
    // delete data._class;

    const uniqueID = generateID(_class, rollNo);

    uploadData(uniqueID, data, res);
});

app.get('/*', (req, res) => {
    res.send('Nothing here');
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started at port " + (process.env.PORT || 3000));

    // users.on('value', snap => {
    // console.log(snap.val());
    // });

    // var child = users.child('71');

    // console.log(child);

    // fetch('https://api.github.com/users/github')
    // .then(res => res.json())
    // .then(json => console.log(json));

    // console.log(users);

    // var UTCDate = new Date().getUTCHours();
    // var date = new Date().getHours();
    // console.log(UTCDate, date);

    // const unixTimeZero = Date.parse('01 Jan 1970 00:00:00 GMT');
    // const javaScriptRelease = Date.parse('04 Dec 1995 00:12:00 GMT');

    // console.log(unixTimeZero);
    // // expected output: 0

    // console.log(javaScriptRelease);
    // // expected output: 818035920000

    // date = new Date(javaScriptRelease);

    // console.log(date.toISOString());

    // console.log(date);

    var date = new Date();

    console.log('UTC/GMT:', date);

    const year = new Intl.DateTimeFormat('en-in', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
    }).format(date);

    const month = new Intl.DateTimeFormat('en-in', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit'
    }).format(date);

    const day = new Intl.DateTimeFormat('en-in', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit'
    }).format(date);

    const time = new Intl.DateTimeFormat('en-in', {
        timeZone: 'Asia/Kolkata',
        timeStyle: 'short',
        hour12: false
    }).format(date);

    date = year + '-' + month + '-' + day;

    console.log('IST:', date + ' ' + time);
});
