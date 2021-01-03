import express from 'express';
import v1 from './v1';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Go away!')
})

app.use(express.json());

app.use('/v1', v1)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})