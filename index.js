const cors = require('cors');
// const { v4: uuidv4 } = require('uuid');
const { nanoid } = require('nanoid');
const jsonServer = require('json-server');
const auth = require('json-server-auth');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(cors());
server.use(jsonServer.bodyParser);

// 自訂中介層，為每筆新增資料生成亂碼 ID
server.use((req, res, next) => {
  if (req.method === 'POST' && req.body) {
    // req.body.id = uuidv4(); // 自動生成亂碼 ID
    req.body.id = nanoid(); // 自動生成亂碼 ID
  }
  next();
});

const rules = auth.rewriter({
  users: 600,
  orders: 600,
  "/admin/orders/*": '/660/orders'
});

server.db = router.db;

server.use(rules);
server.use(auth);
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running');
});

module.exports = server;
