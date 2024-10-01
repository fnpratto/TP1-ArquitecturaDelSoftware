import express from "express";
import dgram from "dgram";
import https from "https";
import axios from "axios";
import StatsD from "hot-shots";
import { rateLimit } from 'express-rate-limit'
import {readFileSync} from 'fs';
const app = express();
const port = 3000;

// express rate limit



// Apply the rate limiting middleware to all requests.
let json = readFileSync("config_rate_limit.json")
let config_rate_limit = JSON.parse(json)
if (config_rate_limit.rate_limit == true) {
    const limiter = rateLimit({
        windowMs: 10 * 1000,
        limit: config_rate_limit.rate_limit_spaceflight_news,
        standardHeaders: 'draft-7',
        legacyHeaders: false, 
    })
    app.use(limiter)
}


// statsd
const client = new StatsD({
    host: 'tp1-arquitecturadelsoftware-graphite-1',
    port: 8125,                   
    protocol: 'udp',                
    errorHandler: (error) => {
      console.error('Error sending metrics:', error);
    },
  });

const sendMetric = (metricName, value) => {
    if (!isNaN(value)) {
        client.timing(`project.${metricName}`, value);
    }
}

  const measureLatency = (start, metricName) => {
    const duration = Date.now() - start;
    sendMetric(metricName, duration);
};
  



//ENDPOINTS TP

app.get("/ping", (req, res) => {
    const start = Date.now();
    res.send("pong");
    measureLatency(start,'latency');
    measureLatency(start,'latencyExternal');
});

app.get("/quote", async (req, res) => {
    const start = Date.now();
    const response = await axios.get(
        "https://uselessfacts.jsph.pl/api/v2/facts/random"
    );
    measureLatency(start,'latencyExternal');

    try {
        const response = await axios.get(
            "https://uselessfacts.jsph.pl/api/v2/facts/random"
        );

        if (response.status === 200) {
            console.log(response.data);
            res.status(200).send(response.data["text"]);
        } else {
            res.status(response.status).send(response.statusText);
        }
    } finally {
        measureLatency(start,'latency');
    }
});

app.get("/spaceflight_news", async (req, res) => {
    const start = Date.now();
    try {
        const response = await axios.get(
            "https://api.spaceflightnewsapi.net/v4/articles/?limit=5"
        );
        measureLatency(start,'latencyExternal');

        let titles = [];

        if (response.status === 200) {
            response.data.results.forEach((e) => {
                if (e.hasOwnProperty("title")) {
                    titles.push(e.title);
                }
            });
            res.status(200).send(titles);
        } else {
            res.status(response.status).send(response.statusText);
        }
    } catch (error) {
        console.error('Error fetching spaceflight news:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        measureLatency(start,'latency');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// API FREE DICTIONARY
app.get("/dictionary", async (req, res) => {

    const start = Date.now(); 
    const word = req.query.word;

    try {
        const response = await axios.get(
            `http://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        measureLatency(start,'latencyExternal');

        if (response.status === 200) {
            const data = response.data[0];
            const result = {
                phonetics: data.phonetics,
                meanings: data.meanings,
            };
            res.status(200).send(result);
        } else {
            res.status(response.status).send(response.statusText);
        }
    } finally {
        measureLatency(start,'latency');
    }
});
