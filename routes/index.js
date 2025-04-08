const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const uploadFolder = path.join(__dirname, 'uploads');
const crypto = require('crypto');
// 確保 uploads 資料夾存在
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

function safeFileName(originalName) {
  const extension = path.extname(originalName);  // 取得副檔名
  const safeName = crypto.randomBytes(16).toString('hex') + extension;  // 生成隨機檔案名稱
  return safeName;
}

// Multer 設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    // 使用生成的隨機檔案名稱
    const uniqueName = safeFileName(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {  // 檔案類型檢查
    // 檢查檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('檔案類型不被允許'));
    }
    cb(null, true);
  }, 
  limits: {
    fileSize: 5 * 1024 * 1024  // 最大檔案大小 5MB
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.sendFile(path.join(__dirname, '..', 'public', 'test.html'));
});



router.get('/getQuestion/:questionId', (req, res, next) => {
  let questionId = req.params.questionId
  let fullPath = path.join(__dirname, '..', 'questionJson', `question${questionId}.json`);


  try {
    const data = fs.readFileSync(fullPath, 'utf8');
    // console.log(data);
    res.json(JSON.parse(data))
  } catch (err) {
    console.error(err);
    res.status(500).send(err)
  }

})

router.get('/uploadPage', (req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'uploadFile.html'));
})

// 上傳檔案
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('沒有收到檔案');
  }
  res.send('上傳成功：' + req.file.filename);
});

router.put('/uploadBase64', (req, res) => {
  const { filename, type, data } = req.body;

  if (!filename || !data) {
    return res.status(400).send('缺少檔名或資料');
  }

  const ext = path.extname(filename);
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
  if (!allowed.includes(ext.toLowerCase())) {
    return res.status(400).send('不允許的副檔名');
  }

  const buffer = Buffer.from(data, 'base64');
  const safeFilename = safeFileName(filename)
  
  const savePath = path.join(__dirname, 'uploads', safeFilename);

  fs.writeFile(savePath, buffer, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('寫入失敗');
    }
    res.send('上傳成功');
  });
});




//下載檔案
router.get('/download/:file', (req, res) => {
  const file = decodeURIComponent(req.params.file);
  const filePath = path.join(uploadFolder, file);
  res.download(filePath, file);
});
//刪除檔案
router.delete('/delete/:file', (req, res) => {
  const fileName = decodeURIComponent(req.params.file);
  const filePath = path.join(__dirname, 'uploads', fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('刪除失敗：', err);
      return res.status(500).send('刪除失敗');
    }
    res.sendStatus(200);
  });
});

// 列出所有檔案
router.get('/files', (req, res) => {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) return res.status(500).send('無法讀取檔案列表');
    res.json(files);
  });
});


router.post('/callPostTest', (req, res) => {
  res.json( {message: "callPostTest Success" + '-' + req.body.now })
})

router.put('/callPutTest', (req, res) => {
  res.json( {message: "callPutTest Success" + '-' + req.body.now })
})

module.exports = router;
