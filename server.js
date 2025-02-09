const cors = require('cors');
const { nanoid } = require('nanoid');
const jsonServer = require('json-server');
const auth = require('json-server-auth');
const simpleGit = require('simple-git'); // 引入 simple-git
const fs = require('fs');

const server = jsonServer.create();
const db = require('./db.json');
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

const git = simpleGit(); // 初始化 Git 操作

// 設定 Git 遠端為 GitHub
git.addRemote(
  'origin',
  `https://${process.env.GITHUB_TOKEN}@github.com/tttom3669/git@github.com:tttom3669/worldWear_db.git`
);

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

// 自訂中介層，為每筆新增資料生成亂碼 ID 並自動備份
server.use((req, res, next) => {
  if (req.method === 'POST' && req.body) {
    req.body.id = nanoid();
  }
  // 資料變更後自動備份到 GitHub
  res.on('finish', () => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      fs.writeFileSync(
        './db.json',
        JSON.stringify(router.db.getState(), null, 2)
      );

      // 自動 Git 提交與推送
      git
        .add('./db.json')
        .commit(`Auto-backup: ${new Date().toISOString()}`)
        .push('origin', 'main')
        .then(() => console.log('✅ 資料已備份到 GitHub'))
        .catch((err) => console.error('❌ 備份失敗：', err));
    }
  });
  next();
});

const rules = auth.rewriter({
  users: 600,
  orders: 600,
  '/admin/users': '/users',
  '/admin/users/*': '/users/$1',
  '/admin/orders/*': '/660/orders/$1',
});

server.db = router.db;

server.use(rules);
server.use(auth);
server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running');
});

module.exports = server;
