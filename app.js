const express = require('express');
const bodyParaser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParaser.json());


app.get('/', async(req, res)=>{
  if(res.status(200)){
    res.send('<h1>데이터 통신 성공</h>');
  } else {
    res.status(404).send('서버 오류')
  }

})



const images = []

app.post('/navebooks', async(req, res)=>{


  const book = req.body.book

    //   res.json({ // Return JSON object with the book
    //     message: "okay?! from a node",
    //     book: book,
    // });

  
try{

  const naverUrl = new URL('https://openapi.naver.com/v1/search/book.json');
  naverUrl.searchParams.set('query', book);
  naverUrl.searchParams.set('display', 1);

  const options ={
    method : 'GET',
    headers : {
      'Content-Type': 'application/json',
      'X-Naver-Client-Id': 'ytaQUUoLOhwBVF3BCR1m',
      'X-Naver-Client-Secret': 'FQqOQ31UUj'
    }
  };
  const response = await fetch(naverUrl.toString(), options);

  // console.log("FetchBookImage function", response);

  if(!response.ok){
    throw new Error (`Naver API fetch failed ${response.status}`)
  }

  const data = await response.json();
  console.log("Response URL", data.items[0].image);

  images.push({
    title : data.items[0].tittle,
    imageURL : data.items[0].image,
  })
  // res.json(images);
  
} catch(error) {
  console.log("Error fetching data at Node", error)
};

})

console.log("BookUrl List", images)


const fetchBookImage = async (book) =>{
  try{

  const naverUrl = new URL('https://openapi.naver.com/v1/search/book.json:');
  naverUrl.searchParams.set('query', book.bookname);
  naverUrl.searchParams.set('display', 1);

  const options ={
    method : 'GET',
    headers : {
      'Content-Type': 'application/json',
      'X-Naver-Client-Id': 'ytaQUUoLOhwBVF3BCR1m',
      'X-Naver-Client-Secret': '5ebWNQFltn'
    }
  };

  const response = await fetch(naverUrl.toString(), options);

  console.log("FetchBookImage function", response);

  if(!response.ok){
    throw new Error (`Naver API fetch failed ${response.status}`)
  }

  const data = await response.json();
  console.log("Response ", data);

  res.json(images);


  } catch(error) {
    console.log("Error fetching data at Node", error)
  }
};



app.listen(port, ()=>{
  console.log(`http://localhost:${port} Let get the hell` )
})
