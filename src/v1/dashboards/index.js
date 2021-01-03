import express from "express";
import { db, errDb, err } from "../_utils";
const router = express.Router();

// v1/dashboards

router.get('/', async (req, res) => {
  try {
    const connection = await db();
    const [rows] = await connection.query(`
      SELECT id, name, sort, deleted
      FROM dashboards
      WHERE deleted IS NULL OR deleted = 0
    `);
    res.json(rows);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (name) {
    try {
      const connection = await db();
      const [response] = await connection.execute(
        `INSERT INTO dashboards (name) VALUES (?)`
        , [name]);
      res.json(response);
    } catch (e) {
      errDb(e, res, req.originalUrl);
    }
  } else {
    err(400, 'Missing parameter or parameters: [name]', res, req.originalUrl);
  }
})

router.put('/:id', async (req, res) => {
  const { name, sort = null, deleted = null } = req.body;
  const { id } = req.params
  try {
    const connection = await db();
    const [response] = await connection.execute(`
      UPDATE dashboards SET
      name = ?, sort = ?, deleted = ?
      WHERE id = ?
      `, [name, sort, deleted, id]);
    res.json(response);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const connection = await db();
    const [tasks] = await connection.execute(`
      UPDATE tasks
      JOIN lists ON tasks.parent_id = lists.id
      JOIN groups ON lists.parent_id = groups.id
      JOIN dashboards ON groups.parent_id = dashboards.id
      SET tasks.deleted = 1
      WHERE dashboards.id = ?
      `, [id]);
    const [lists] = await connection.execute(`
      UPDATE lists
      JOIN groups ON lists.parent_id = groups.id
      JOIN dashboards ON groups.parent_id = dashboards.id
      SET lists.deleted = 1
      WHERE dashboards.id = ?
      `, [id]);
    const [groups] = await connection.execute(`
      UPDATE groups SET deleted = 1 WHERE parent_id = ?
      `, [id]);
    const [response] = await connection.execute(`
      UPDATE dashboards SET deleted = 1 WHERE id = ?
      `, [id]);
    response.affectedTasks = tasks.affectedRows;
    response.affectedLists = lists.affectedRows;
    response.affectedGroups = groups.affectedRows;
    res.json(response);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
})

export default router;