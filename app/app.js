import express from 'express';
//import redis from 'redis';

const app = express();
const port = 3000;

//const client = redis.createClient();

//client.on('error', (err) => console.log('Redis Client Error', err));

//client.connect();

//ENDPOINT PING

app.get('/ping', (req, res) => {
  res.send('pong');
});
console.log("trying!")
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// API FREE DIRECRIONARY
// app.get('/dictionary', async (req, res) => {
//     const word = req.query.word;
//     const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
//     const { phonetics, meanings } = response.data[0];
//     res.json({ phonetics, meanings });
//   });
  
// ///spaceflight_news:
// app.get('/spaceflight_news', async (req, res) => {
//     const response = await axios.get('https://api.spaceflightnewsapi.net/v3/articles?_limit=5');
//     const titles = response.data.map(article => article.title);
//     res.json(titles);
// });


// //
// app.get('/quote', async (req, res) => {
//     const response = await axios.get('https://api.quotable.io/random');
//     const { content, author } = response.data;
//     res.json({ content, author });
//   });
  