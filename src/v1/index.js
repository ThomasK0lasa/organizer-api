import express from "express";
import { db, errDb, hierarchy } from "./_utils";
import tasks from "./tasks";
const app = express();

app.use('/tasks', tasks);
// app.use('/dashboards', dashboards);
// app.use('/groups', groups);
// app.use('/tables', tables);

app.get('/', async (req, res) => {
  try {
    const connection = await db();
    const [dashboards] = await connection.query(`
      SELECT id, name, sort
      FROM dashboards
    `);
    const [groups] = await connection.query(`
      SELECT id, name, sort, parent_id
      FROM groups
    `);
    const [lists] = await connection.query(`
      SELECT id, name, sort, parent_id
      FROM lists
      WHERE deleted IS NULL OR deleted = 0
    `);
    const [tasks] = await connection.query(`
      SELECT id, content, done, created_on, modified_on, sort, parent_id
      FROM tasks
      WHERE deleted IS NULL OR deleted = 0
    `);
    const json = hierarchy([tasks, lists, groups, dashboards]);
    res.json(json);
  } catch (e) {
    errDb(e, res, req.originalUrl);
  }
})

export default app;