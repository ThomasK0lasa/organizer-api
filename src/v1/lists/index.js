import express from "express";
import { db, errDb, err } from "../_utils";
const router = express.Router();

// v1/lists

router.get('/', async (req, res) => {
  try {
    const connection = await db();
    const [rows] = await connection.query(`
      SELECT id, name, sort, parent_id, deleted
      FROM lists
      WHERE deleted IS NULL OR deleted = 0
    `);
    res.json(rows);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
});

router.post('/', async (req, res) => {
  const { name = '', parent_id } = req.body;
  if (parent_id) {
    try {
      const connection = await db();
      const [response] = await connection.execute(
        `INSERT INTO lists (name, parent_id)
        VALUES (?, ?)`
        , [name, parent_id]);
      res.json(response);
    } catch (e) {
      errDb(e, res, req.originalUrl);
    }
  } else {
    err(400, 'Missing parameter or parameters: [parent_id]', res, req.originalUrl);
  }
})

router.put('/:id', async (req, res) => {
  const { name = '', sort = null, parent_id, deleted = null } = req.body;
  const { id } = req.params
  try {
    const connection = await db();
    const [response] = await connection.execute(`
      UPDATE lists SET
      name = ?, sort = ?,
      parent_id = ?, deleted = ?
      WHERE id = ?
      `, [name, sort, parent_id, deleted, id]);
    res.json(response);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const connection = await db();
    const [ tasks ] = await connection.execute(`
      UPDATE tasks SET deleted = 1 WHERE parent_id = ?
      `, [id]);
    const [response] = await connection.execute(`
      UPDATE lists SET deleted = 1 WHERE id = ?
      `, [id]);
    response.affectedTasks = tasks.affectedRows;
    res.json(response);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
})

export default router;