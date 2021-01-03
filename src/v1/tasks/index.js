import express from "express";
import { db, errDb } from "../_utils";
const router = express.Router();

// v1/tasks

router.get('/', async (req, res) => {
  try {
    const connection = await db();
    const [rows, fields] = await connection.query('SELECT 1 + 1 AS solution');
    res.json( rows );
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
});

router.post('/', async (req, res) => {
  const { content } = req.body;
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log(date);
  if (content) {
    try {
      const connection = await db();
      const [ response ] = await connection.execute(
        `INSERT INTO tasks (content, done, created_on, groups_id)
        VALUES (?, 0, ?, 1)`
        , [content, date]);
      res.json( response );
    } catch (e) {
      errDb(e, res, req.originalUrl);
    }
  }
})

router.put('/:id', async (req, res) => {
  const task = req.body.name;
  console.log(task);
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  console.log(date);
  if (task) {
    try {
      const connection = await db();
      //console.log(connection.prepare('INSERT INTO tasks (content, done, created_on, groups_id) VALUES (?, 0, ?, 0)'));
      /*const [id] = await connection.execute(
        `INSERT INTO tasks (content, done, created_on, groups_id)
        VALUES (?, 0, ?, 0)`
        , [task, date]);*/
      res.json( 'a' );
    } catch (e) {
      console.error(e);
      errDb(res, req.originalUrl);
    }
  }
})

router.delete('/:id', async (req, res) => {

})

export default router;