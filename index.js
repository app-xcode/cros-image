const express = require('express');
const axios = require('axios');

const app = express();

app.get('/', async (req, res) => {
  const url = req.query.quest;

  if (!url) {
    return res.status(400).send('URL is required, Sample: https://cros-image.vercel.app/?quest=https://example.com/images/image.jpg');
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (err) {
    res.status(500).send('Error fetching URL:');
  }
});

app.listen(3000, () => {
  console.log('Proxy running on http://localhost:3000');
});