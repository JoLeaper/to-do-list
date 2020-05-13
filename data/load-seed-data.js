const client = require('../lib/client');
// import our seed data:
const toDoList = require('./todos.js');
const usersData = require('./users.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      toDoList.map(listItem => {
        return client.query(`
                    INSERT INTO todos (task, priority_level, completed, user_id)
                    VALUES ($1, $2, $3, $4);
                `,
        [listItem.task, listItem.priority_level, listItem.completed, user.id]);
      })
    );
    

    console.log('seed data load complete');
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
