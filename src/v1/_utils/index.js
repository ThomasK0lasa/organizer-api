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
    status = 503;
    message = 'Service Unavai­lable - Broken Database connection';
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

export function err(status, message, res, originalUrl) {
  res.status(status);
  res.send({
    error: {
      message: message,
      url: originalUrl
    }
  })
}

export function hierarchy(args, names) {
  let obj = {};
  for (let i = 0; i < args.length; i++) {
    const helper = {};
    args[i].forEach(
      arg => {
        const id = arg['parent_id'];
        delete arg['parent_id'];
        if (!helper[id] && i !== args.length - 1) {
          helper[id] = {};
        }
        if (i === 0) { // last children nodes
          helper[id][arg.id] = arg;
        } else if (i === args.length - 1) { // root node
          helper[arg.id] = { ...arg, [getName(i)]: obj[arg.id] };
        } else { // nodes between
          helper[id][arg.id] = { ...arg, [getName(i)]: obj[arg.id] };
        }
      }
    )
    obj = { ...helper };
  }
  return obj;
  function getName(id) {
    return (!names) ? 'children' : names[id - 1];
  }
}