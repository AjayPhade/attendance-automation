const express = require("express");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');

const app = express();

//Used to access static files from public folder
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

const admin = require("firebase-admin");

const serviceAccount = require("d:/attendance-automation-ds-firebase-adminsdk-ct6f0-692899d849.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://attendance-automation-ds-default-rtdb.firebaseio.com"
});

const database = admin.database().ref();
const users = database.child('users');

function submitForm(formLink, uniqueID, res) {
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
                data = convertData(uniqueID, data);

                var params = new URLSearchParams(data);

                var options = { method: 'POST', body: params };

                fetch(formURL, options).then(resposne => {
                    if (resposne.ok) { // res.status >= 200 && res.status < 300
                        console.log('Done');
                        res.send('Done');
                    } else {
                        console.log(resposne.statusText);
                        res.send(resposne.statusText);
                    }
                });
            }
        } else {
            console.log('No Data Available');
            res.send('No Data Available');
        }
    }).catch(err => {
        console.log(err);
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
                    console.log(err);
                    res.send(err);
                } else {
                    console.log('Data uploaded successfully');
                    res.send('Data uploaded successfully');
                }
            });
        }
    }).catch(err => {
        console.log(err);
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

function convertData(data) {
    const entry = {
        669753067: data.rollNo,
        679409453: data.subject,
        1485670224: data.fullName,
        1501085151: data._class,
        1644672609: data.email,
        1718818963: data.mobile,
        emailAddress: data.email
    };

    return entry;
}

app.get('/', (req, res) => {
    // res.render('index.html');
});

app.get('/lol', (req, res) => {
    console.log('lol');

    const formLink = req.query.formLink;
    const uniqueID = req.query.uniqueID;

    submitForm(formLink, uniqueID, res);

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

app.listen(3000, () => {
    console.log("Server started at port 3000");

    // users.on('value', snap => {
    // console.log(snap.val());
    // });

    // var child = users.child('71');

    // console.log(child);

    // fetch('https://api.github.com/users/github')
    // .then(res => res.json())
    // .then(json => console.log(json));

    var UTCDate = new Date().getUTCHours();
    var date = new Date().getHours();
    console.log(UTCDate, date);
});
