const fetch = require("node-fetch");
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 4000;
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');



app.use(cors());
app.use(bodyParser.json());

// 기본 서버 확인 
app.get('/', async(req, res)=>{
  if(res.status(200)){
    res.send('<h1>데이터 통신 성공</h>');
  } else {
    res.status(404).send('서버 오류')
  }

})



// Supabase fetching data Logic
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

app.get('/accommodation', async (req, res) =>{
  
  try{
    const { data, error } = await supabase
    .from('accoms')
    .select('*');
    if (error) {
      throw error;
    }
    
    // console.log("작동중", data);
    res.json(data);

  } catch(error) {
    res.status(500).json({ error : error.message });
  }
});


app.post("/booking", async (req, res) => {
  const bookingConfirm = req.body;
  const accommodation = bookingConfirm.bookingAccom;
  const status = bookingConfirm.status
  const startDate = bookingConfirm.dates.bookingStartDate
  const endDate = bookingConfirm.dates.bookingEndDate

  try {

    const data = {
      accom_name: accommodation.accom_name,
      accom_type: accommodation.accom_type,
      total_price: accommodation.price,
      order_status: status,
      guest_number: 0, // Consider getting guest number from the request body or setting a default value
      start_date: startDate,
      end_date: endDate,
      guest_phone: '010-1234-1234', // Replace with a way to get user's phone number
      guest_email: 'hong@gmail.com', // Replace with a way to get user's email
      guest_id: "test" // Consider obtaining guest ID from authentication or a form
    };

    const { error } = await supabase.from('bookings').insert(data);

    if (error) {
      console.error("Error saving booking to Supabase:", error);
      res.status(500).send({ message: "Error creating booking." }); // Informative error message
      return; // Exit the function after sending the error response
    }

    console.log("Booking stored in Supabase successfully!");
    res.json({ message: "Booking created successfully!" });

  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send({ message: "An error occurred." }); // Generic error message for unexpected issues
  }
});



// app.post("/booking", async (req, res)=>{
//   const bookingConfirm = req.body;
//   const accommodation = bookingConfirm.bookingAccom;
//   const status = bookingConfirm.status
//   const startDate = bookingConfirm.dates.bookingStartDate
//   const endDate = bookingConfirm.dates.bookingEndDate

//   console.log(bookingConfirm)
//   const datas = {
//     accom_name : accommodation.accom_name,
//     accom_type : accommodation.aaccom_type,
//     total_price : accommodation.price,
//     oder_status : status,
//     guest_number : 0,
//     start_date : startDate,
//     end_date : endDate,
//     guest_phone : '010-1234-1234',
//     guest_email : 'hong@gmail.com',
//     guest_id : "test"
//   }

//   try{
//     const { data, error }= await supabase
//     .from('bookings')
//     .insert(datas)
//   }
//   catch (error) {
//     throw new Error ("Error occured", error.message)
//   }

// })




// 네이버 Social Media 로그인 
const client_id = process.env.NAVER_FETCH_API_ID
const client_secret = process.env.NAVER_FETCH_API_KEY
const state = "RANDOM_STATE-anyword";
const redirectURI = encodeURI("http://localhost:3000/callback");
const api_url = "";

app.get("/naverlogin", function (req, res) {
  api_url =
    "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" +
    client_id +
    "&redirect_uri=" +
    redirectURI +
    "&state=" +
    state;
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  res.end(
    "<a href='" +
      api_url +
      "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>"
  );
});


app.get("/callback", async function (req, res) {
  const code = req.query.code;
  const state = req.query.state;
  const api_url =
    "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=" +
    client_id +
    "&client_secret=" +
    client_secret +
    "&redirect_uri=" +
    redirectURI +
    "&code=" +
    code +
    "&state=" +
    state;

    // const request = require('request');
    // const options = {
    //     url: api_url,
    //     headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    //   };
    // request.get(options, function (error, response, body) {
    //   if (!error && response.statusCode == 200) {
    //     res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
    //     res.end(body);
    //   } else {
    //     res.status(response.statusCode).end();
    //     console.log('error = ' + response.statusCode);
    //   }



    // });



    const response = await fetch(api_url, {
      headers: {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
      },
    });
  
    const tokenRequest = await response.json();
    
    if ("access_token" in tokenRequest) {
      const { access_token } = tokenRequest;
      const apiUrl = "https://openapi.naver.com/v1/nid/me";
  
      const data = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
  
      const userData = await data.json();
  
      //사용자 정보 콘솔로 받아오기 -> DB에 저장해야 합니다.
      console.log("userData:", userData);
    }
  
    return res.send("DB에 저장하고 랜드페이지로 redirect ");
  });





// 네이버 BOOK Image 받어 오기
app.post('/navebooks', async(req, res)=>{


  try {
    const title = req.body.book
    const images =[]
    for (const book of Object.values(title)){


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

  // console.log("Response URL", data.items[0]);

  images.push({
    title : data.items[0].title,
    imageURL : data.items[0].image,
    description : data.items[0].description
  })
}
  res.json(images);
// console.log("BookUrl List1", images)
  
} 

catch(error) {
  console.log("Error fetching data at Node", error)
};
})



app.listen(port, ()=>{
  console.log(`http://localhost:${port}/ Let get the hell` )
})
