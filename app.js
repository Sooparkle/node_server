const express = require('express');
const fetch = require("node-fetch");
const bodyParaser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 4000;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();


app.use(cors());
app.use(bodyParaser.json());


//사용자 테스트 페이지
app.get('/', async(req, res)=>{
  if(res.status(200)){
    res.send('<h1>데이터 통신 성공</h>');
  } else {
    res.status(404).send('서버 오류')
  }
})

// Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)



// 네이버 Social Media 로그인 
const client_id = process.env.NODE_NAVER_API_ID;
const client_secret = process.env.NODE_NAVER_API_SECRET;
const state = "RANDOM_STATE-anyword";
const redirectURI = encodeURI("http://localhost:3000/callback");
const api_url = "";




// accomudation data fetch from Supabase
app.get('/accommodation', async (req, res) =>{
  
  try{
    const { data, error } = await supabase
    .from('accoms')
    .select('*');
    if (error) {
      throw error;
    }
    
    console.log("작동중", data);
    res.json(data);

  } catch(error) {
    res.status(500).json({ error : error.message });
  }
});



app.get("/callback", async function (req, res) {
  const code = req.query.code;
  const state = req.query.state;
  const redirectURI = "http://localhost:3000/login";
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
      const authData ={
        name : userData.response.name,
        email : userData.response.email
      }
    // try{
    //   await supabaseClient
    //   .from('users') // Your table name
    //   .upsert({
    //     email: authData.email,
    //     name: authData.name,
    //   })
    //   .eq('email', authData.email) // Condition for merging existing data
    //   .execute();


    // console.log('User data saved to Supabase successfully!');
    // res.redirect('/your-landing-page'); // Redirect to landing page
    
    // } catch{

    //   console.error('Error saving user data to Supabase:', error);
    //   res.status(500).send('Error saving data');

    // }
    }
  
    return res.send("DB에 저장하고 랜드페이지로 redirect ");
  });


app.listen(port, ()=>{
  console.log(`http://localhost:${port} Let get the hell` )
})
