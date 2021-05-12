const express = require('express')
const app = express()
app.use(express.static(__dirname+'/'));
const port = 3000

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})