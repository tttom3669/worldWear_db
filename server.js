const cors = require('cors');
const { nanoid } = require('nanoid');
const jsonServer = require('json-server');
const auth = require('json-server-auth');

const server = jsonServer.create();

const db = process.env.USE_FILE === 'true' ? 'db.json' : require('./db.json');
const router = jsonServer.router(db);

const middlewares = jsonServer.defaults();

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

// 自訂中介層，為每筆新增資料生成亂碼 ID
server.use((req, res, next) => {
  if (req.method === 'POST' && req.body) {
    req.body.id = nanoid();
  }
  next();
});

const rules = auth.rewriter({
  users: 600,
  orders: 600,
  favorites: 600,
  '/admin/users': '/660/users',
  '/admin/users/*': '/660/users/$1',
  '/admin/orders': '/660/orders',
  '/admin/orders/*': '/660/orders/$1',
  '/admin/products': '/660/products',
  '/admin/products/*': '/660/products/$1',
  '/admin/coupons': '/660/coupons',
  '/admin/coupons/*': '/660/coupons/$1',
});

server.db = router.db;

server.use(rules);
server.use(auth);
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running');
});

module.exports = server;
