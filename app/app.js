import express from "express";
import axios from "axios";
import StatsD from "hot-shots";
const app = express();
const port = 3000;

// statsd
const client = new StatsD({
    host: "tp1-arquitecturadelsoftware-graphite-1",
    port: 8125,
    protocol: "udp",
    errorHandler: (error) => {
        console.error("Error sending metrics:", error);
    },
});

const sendMetric = (metricName, value) => {
    if (!isNaN(value)) {
        client.timing(`project.${metricName}`, value);
    }
};

const measureLatency = (start, metricName) => {
    const duration = Date.now() - start;
    sendMetric(metricName, duration);
};

//ENDPOINTS TP

app.get("/ping", (req, res) => {
    const start = Date.now();
    res.send("pong");
    measureLatency(start, "latency");
    measureLatency(start, "latencyExternal");
});

app.get("/quote", async (req, res) => {
    const start = Date.now();
    const response = await axios
        .get("https://uselessfacts.jsph.pl/api/v2/facts/random")
        .then((response) => {
            if (response.status === 200) {
                console.log(response.data);
                res.status(200).send(response.data["text"]);
            } else {
                res.status(response.status).send(response.statusText);
            }
            measureLatency(start, "latency");
        })
        .catch((error) => {
            res.status(error.response.status).send(error.response.data);
        })
        .finally(measureLatency(start, "latencyExternal"));
});

app.get("/spaceflight_news", async (req, res) => {
    const start = Date.now();
    const response = await axios
        .get("https://api.spaceflightnewsapi.net/v4/articles/?limit=5")
        .then((response) => {
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
            measureLatency(start, "latency");
        })
        .catch((error) => {
            if (error.response != undefined) {
                res.status(error.response.status).send(error.response.data);
            }
        })
        .finally(measureLatency(start, "latencyExternal"));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// API FREE DICTIONARY
app.get("/dictionary", async (req, res) => {
    const start = Date.now();
    const word = req.query.word;

    const response = await axios
        .get(`http://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then((response) => {
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
            measureLatency(start, "latency");
        })
        .catch((error) => {
            res.status(error.response.status).send(error.response.data);
        })
        .finally(measureLatency(start, "latencyExternal"));
});
