import express from "express";
import { db, errDb, err } from "../_utils";
const router = express.Router();

// v1/tasks

router.get('/', async (req, res) => {
  try {
    const connection = await db();
    const [rows] = await connection.query(`
      SELECT id, content, done, created_on, modified_on, sort, parent_id
      FROM tasks
      WHERE deleted IS NULL OR deleted = 0
    `);
    res.json(rows);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
});

router.post('/', async (req, res) => {
  const { content, parent_id } = req.body;
  const created_on = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (content && parent_id) {
    try {
      const connection = await db();
      const [response] = await connection.execute(
        `INSERT INTO tasks (content, done, created_on, parent_id)
        VALUES (?, 0, ?, ?)`
        , [content, created_on, parent_id]);
      res.json(response);
    } catch (e) {
      errDb(e, res, req.originalUrl);
    }
  } else {
    err(400, 'Missing parameter or parameters: [content, parent_id]', res, req.originalUrl);
  }
})

router.put('/:id', async (req, res) => {
  const { content, done, created_on, sort = null, parent_id, deleted = null} = req.body;
  const { id } = req.params
  const modified_on = new Date().toISOString().slice(0, 19).replace('T', ' ');
  try {
    const connection = await db();
    const [response] = await connection.execute(`
      UPDATE tasks SET
      content = ?, done = ?,
      created_on = ?, modified_on = ?,
      sort = ?, parent_id = ?, deleted = ?
      WHERE id = ?
      `, [content, done, created_on, modified_on, sort, parent_id, deleted, id]);
    res.json(response);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const modified_on = new Date().toISOString().slice(0, 19).replace('T', ' ');
  try {
    const connection = await db();
    const [response] = await connection.execute(`
      UPDATE tasks SET modified_on = ?, deleted = 1 WHERE id = ?
      `, [ modified_on, id]);
    res.json(response);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
})

export default router;