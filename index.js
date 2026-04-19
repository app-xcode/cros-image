const express = require('express');
const axios = require('axios');
const cors = require('cors');
const sharp = require('sharp');

const app = express();
app.use(cors());

app.get('/', async (req, res) => {
  const targetUrl = req.query.quest;
  const size = Number(req.query.size);

  if (!targetUrl) {
    return res.status(400).send('URL target dibutuhkan. contoh: <a href="https://cros-image.vercel.app/?quest=https://avatars.githubusercontent.com/u/197889673&size=500">https://cros-image.vercel.app/?quest=https://avatars.githubusercontent.com/u/197889673&size=500</a>');
  }
  let responseData;
  try {
    const response = await axios.get(targetUrl, {
      responseType: 'arraybuffer',
      timeout: 5000 // Mencegah request gantung terlalu lama
    });

    const contentType = response.headers['content-type'];
    // Validasi sederhana agar hanya memproses gambar
    if (!contentType.startsWith('image/')) {
      return res.status(400).send('URL bukan merupakan gambar.');
    }
    if (size) {
      const metadata = await sharp(response.data).metadata();
      if (metadata?.width < size) {
        responseData = response.data
      }
      else {
        const resized = await sharp(Buffer.from(response.data))
          .resize(size)
          .toBuffer();
        responseData = resized
      }
    } else {
      responseData = response.data
    }

    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Opsional: Cache 1 hari
    res.send(responseData);

  } catch (err) {
    console.log(err)
    const status = err.response ? err.response.status : 500;
    res.status(status).send('Gagal mengambil gambar.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy aktif di port http://localhost:${PORT}`);
});
