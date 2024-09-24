import express from 'express';
import dgram from 'dgram' ;
import https from 'https';
const app = express();
const port = 3000;


const sendMessage = (client, message) => {
  return new Promise((resolve,reject)=> {
    client.send(message,8125,'localhost',(err)=>{
      if(err){
        reject(err);
      } else {
        resolve ('Message sent: ${message.toString()}');
      }
    });
  });
};


const sendMessageWithTimeout = async (client, duration) => {
const endTime = Date.now() + duration;

const sendRepeatedMessage = async () => {
  if (Date.now() >= endTime){
    client.close();
    return;
  }

  const randomValue = Math.floor(Math.random()*100);
  const message = Buffer.from ('example:${randomValue} c');

  try{
    const result = await sendMessage(client,message);
    console.log (result);
  } catch (err){
    console.log ('Error: ',err);
  }

  setTimeout(sendRepeatedMessage,1000);
};


sendRepeatedMessage();
};

//ENDPOINT 

app.get('/udp', (req, res) => {
  const client = dgram.createSocket('udp4');
  const duration = 10*1000;

  sendMessageWithTimeout(client,duration);

  res.send('Started sending messages for 10 seconds');
});


//ENDPOINT PING

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/quote', (req, res) => {

  // test outgoing request
  https.get('https://zenquotes.io/api/random', _res => {
    let data = [];
    const headerDate = _res.headers && _res.headers.date ? _res.headers.date : 'no response date';
    console.log('Status Code:', _res.statusCode);
    console.log('Date in Response header:', headerDate);

    _res.on('data', chunk => {
      data.push(chunk);
    });

    _res.on('end', () => {
      console.log(`${data}`);
      res.send(`${data}`)
    });
  }).on('error', err => {
    console.log('Error: ', err.message);
    res.send("Error!")
  });
});

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

