const DB_URI = "mongodb://ping:ping@ds012538.mlab.com:12538/atg-db";

var express  = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),

    pings = {},

    PingSchema = new mongoose.Schema({
      host: String,
      count: Number,
    }),

    Ping = mongoose.model('Ping', PingSchema);


mongoose.connect(DB_URI, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

function makePing(ping) {
    const id = ping._id;
    p = pings[id];
    if (p == undefined) {
        p = {
            id: id,
            host: ping.host,
            count: ping.count,
            status: "idle",
            statistics: {},
        }
        pings[id] = p;
    }
    return p;
}

function deletePing(ping) {
    delete pings[ping._id];
    return {};
}

function stopPing(ping) {
    p = makePing(ping);
    p.status = "stopped";
    return {"retult": "success"};
}

function startPing(ping) {
    p = makePing(ping);
    p.status = "running";
    return {"retult": "success"};
}

express()

    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))


    .get('/api', function (req, res) {
        res.status(200).json(["pings"]);
    })


    .get('/api/pings', function (req, res) {
        Ping.find((err, pings) => {
            res.status(200).json(pings.map(makePing));
        });
    })

    .post('/api/pings', function (req, res) {
        var ping = new Ping(req.body);
        ping.save((err) => {
            res.status(200).json(makePing(ping));
        });
    })


    .get('/api/pings/:id', function (req, res) {
        Ping.findById(req.params.id, ( err, ping ) => {
            res.status(200).json(makePing(ping));
        });
    })


    .put('/api/pings/:id', function (req, res) {
        Ping.findById(req.params.id, (err, ping) => {
            ping.host = req.body.host;
            ping.count = req.body.count;
            ping.save((err, ping) => {
                res.status(200).json(makePing(ping));
            });
        });
    })


    .delete('/api/pings/:id', function (req, res) {
        Ping.findById(req.params.id, (err, ping) => {
            ping.remove((err, ping) => {
                res.status(200).json(deletePing(ping));
            });
        });
    })


    .post('/api/pings/:id/stop', function (req, res) {
        Ping.findById(req.params.id, (err, ping) => {
            res.status(200).json(stopPing(ping));
        })
    })


    .post('/api/pings/:id/start', function (req, res) {
        Ping.findById(req.params.id, (err, ping) => {
            res.status(200).json(startPing(ping));
        })
    })


    .use(express.static(__dirname + '/'))
    
    .listen(process.env.PORT || 5000);
