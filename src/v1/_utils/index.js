import config from './config'
import mysql from 'mysql2/promise';

export async function db() {
  try {
    return await mysql.createConnection({
      ...config
    });
  } catch (e) {
    throw e;
  }
}

export function errDb(e, res, originalUrl) {
  console.error(e);
  let status;
  let message;
  if (e.code === 'ECONNREFUSED') {
    status = 500;
    message = 'Broken Database connection';
  } else {
    status = 500;
    message = 'Server Internal Error';
  }
  res.status(status);
  res.send({
    error: {
      message: message,
      url: originalUrl
    }
  })
}

export function hierarchy(args) {
  const names = ['tasks', 'lists', 'groups'];
  let obj = {};
  for (let i = 0; i < args.length; i++) {
    const helper = {};
    args[i].forEach(
      arg => {
        const id = arg['parent_id'];
        delete arg['parent_id'];
        if (!helper[id] && i !== args.length -1) {
          helper[id] = {};
        }
        if (i === 0) {
          helper[id][arg.id] = arg;
        } else if (i === args.length -1) {
          helper[arg.id] = { ...arg, [names[i-1]]: obj[arg.id] };
        } else {
          helper[id][arg.id] = { ...arg, [names[i-1]]: obj[arg.id] };
        }
      }
    )
    obj = { ...helper };
  }
  return obj;
}