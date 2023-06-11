const connectToMongo=require('./dairydb');
const express = require('express')
var cors=require('cors')
const path =require('path')

connectToMongo();

const app = express()
const port = 5000


app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname,'../build')))


//available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))
app.get('/', (req, res) => {
  res.send('Hello Mani')
})
app.use('*',function(req,res){
  res.sendFile(path.join(__dirname,'../build/index.html'))
})

app.listen(port, () => {
  console.log(`My-Dairy Backend listening on http://localhost:${port}`)
})