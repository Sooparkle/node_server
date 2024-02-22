const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;


app.use(bodyParser.json());

app.get("/", (req, res)=>{
  if(res.status(200)){
    res.send('<h1>Hello Server</h1>')
  } else{
    res.status(404).send("서버 오류")
    console.log("Node Frot rendering Failed")
  }
})


const image = []


app.post('/api', async (req, res)=>{

try{
  const word = req.body.word;
  console.log("Received data",word);

  const naverUrl = new URL("https://openapi.naver.com/v1/search/book.json");
  naverUrl.searchParams.set('query', word);
  naverUrl.searchParams.set('display', 1);

  const options = {
    method : 'GET',
    headers : {
      'Content-Type': 'application/json',
      'X-Naver-Client-Id': 'ytaQUUoLOhwBVF3BCR1m',
      'X-Naver-Client-Secret': 'WWhC647In7'
    }
  };

  const response = await fetch(naverUrl.toString(), options);
  
  console.log("Sending shapg of URL", response);
  
  if(!response.ok){
    throw new Error (`Naver API Failed ${response.status}`);
  }

  const data = await response.json();
  console.log("Data coming from NAVER",data);
  const imageUrl = data.items.image;
  image.push({word : imageUrl})

  console.log("image Data check inside", typeof(image), image)

}
catch(error){
  console.error("Error", error)
  res.status(400).json({message : "Invaild request data"})
}

});

console.log("image Data check", typeof(image), image)


app.listen(port, ()=>{
  console.log(`http://localhost:${port} Node Server starts ${port}`);
})