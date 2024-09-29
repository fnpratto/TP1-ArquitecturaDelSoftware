import express from "express";
import dgram from "dgram";
import https from "https";
import axios from "axios";

const app = express();
const port = 3000;

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

// //ENDPOINTS PROPIOS

app.get("/udp", (req, res) => {
    const client = dgram.createSocket("udp4");
    const duration = 10 * 1000;

    sendMessageWithTimeout(client, duration);

    res.send("Started sending messages for 10 seconds");
});

//ENDPOINTS TP

app.get("/ping", (req, res) => {
    res.send("pong");
});

app.get("/quote", async (req, res) => {
    const response = await axios.get(
        "https://uselessfacts.jsph.pl/api/v2/facts/random"
    );

    if (response.status === 200) {
        console.log(response.data);
        res.status(200).send(response.data["text"]);
    } else {
        res.status(response.status).send(response.statusText);
    }
});

app.get("/spaceflight_news", async (req, res) => {
    const response = await axios.get(
        "https://api.spaceflightnewsapi.net/v4/articles/?limit=5"
    );

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
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// API FREE DICTIONARY
app.get("/dictionary", async (req, res) => {
    const word = req.query.word;
    const response = await axios.get(
        `http://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    if (response.status === 200) {
        res.status(200).send(response.data[0]);
    } else {
        res.status(response.status).send(response.statusText);
    }
});
