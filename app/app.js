import express from "express";
import dgram from "dgram";
import axios from "axios";
import StatsD from "hot-shots";
import { createClient } from "redis";

const app = express();
const port = 3000;
const redisClient = createClient({ url: "redis://redis:6379" });

(async () => {
    await redisClient.connect();
})();

// statsd
const client = new StatsD({
    host: "tp1-arquitecturadelsoftware-graphite-1",
    port: 8125,
    protocol: "udp",
    errorHandler: (error) => {
        console.error("Error sending metrics:", error);
    },
});

const sendMessage = (client, message) => {
    return new Promise((resolve, reject) => {
        client.send(message, 8125, "localhost", (err) => {
            if (err) {
                reject(err);
            } else {
                resolve("Message sent: ${message.toString()}");
            }
        });
    });
};

const sendMessageWithTimeout = async (client, duration) => {
    const endTime = Date.now() + duration;

    const sendRepeatedMessage = async () => {
        if (Date.now() >= endTime) {
            client.close();
            return;
        }

        const randomValue = Math.floor(Math.random() * 100);
        const message = Buffer.from("example:${randomValue} c");

        try {
            const result = await sendMessage(client, message);
            console.log(result);
        } catch (err) {
            console.log("Error: ", err);
        }

        setTimeout(sendRepeatedMessage, 1000);
    };

    sendRepeatedMessage();
};

const sendMetric = (metricName, value) => {
    if (!isNaN(value)) {
        client.timing(`project.${metricName}`, value);
    }
}

const measureLatency = (start, metricName) => {
    const duration = Date.now() - start;
    sendMetric(metricName, duration);
};

// //ENDPOINTS PROPIOS

app.get("/udp", (req, res) => {
    const client = dgram.createSocket("udp4");
    const duration = 10 * 1000;

    sendMessageWithTimeout(client, duration);

    res.send("Started sending messages for 10 seconds");
});

//ENDPOINTS TP

app.get("/ping", (req, res) => {
    const start = Date.now();
    res.send("pong");
    measureLatency(start, "latency");
    measureLatency(start, "latencyExternal");
});

app.get("/quote", async (req, res) => {
    const start = Date.now();
    let quote;

    const quoteString = await redisClient.get("quote");

    if (quoteString !== null) {
        quote = JSON.parse(quoteString);
    } else {
        const response = await axios.get(
            "https://uselessfacts.jsph.pl/api/v2/facts/random"
        );
        measureLatency(start, "latency");

        if (response.status === 200) {
            quote = response.data["text"];
            await redisClient.set("quote", JSON.stringify(quote), {
                EX: 5,
            });
        } else {
            res.status(response.status).send(response.statusText);
        }
    }
    res.status(200).send(quote);
    measureLatency(start, "latencyExternal");

});


app.get("/spaceflight_news", async (req, res) => {
    const start = Date.now();
    let titles;

    const titlesString = await redisClient.get("space_news");

    if (titlesString !== null) {
        titles = JSON.parse(titlesString);
    } else {
        titles = [];

        const response = await axios.get(
            "https://api.spaceflightnewsapi.net/v4/articles/?limit=5"
        );
        measureLatency(start, "latency");

        if (response.status === 200) {
            response.data.results.forEach((e) => {
                if (e.hasOwnProperty("title")) {
                    titles.push(e.title);
                }
            });

            await redisClient.set("space_news", JSON.stringify(titles), {
                EX: 5,
            });
        } else {
            res.status(response.status).send(response.statusText);
        }
    }
    res.status(200).send(titles);
    measureLatency(start, "latencyExternal");
});

app.get("/dictionary", async (req, res) => {
    const start = Date.now();
    const word = req.query.word;
    let words = {};

    const wordsString = await redisClient.get("dictionary");


    if (wordsString !== null) {
        words = JSON.parse(wordsString);
    } else {
        const response = await axios.get(
            `http://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        measureLatency(start, "latency");
        if (response.status === 200) {
            words[word] = response.data[0];

            await redisClient.set("dictionary", JSON.stringify(words), {
                EX: 5,
            });
        } else {
            res.status(response.status).send(response.statusText);
        }
    }
    res.status(200).send(words[word]);
    measureLatency(start, "latencyExternal");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});