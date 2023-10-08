var express = require("express")
var app = express()
const xml2js = require('xml2js')
const axios = require('axios')
const cheerio = require('cheerio')
const options = {
  method: 'GET',
  url: `https://trends.google.com/trends/trendingsearches/daily/rss?geo=TH`,
  header: {
    'X-RapidAPI-Host': `trends.google.com`
  }
}
//options นี้จะเก็บ option เพื่อให้ axios ส่ง request ไปเอา googletrend มา

var port = 3000;

app.get("/", (req, res) => { // เมื่อเข้า url http://localhost:3000/ แบบ get จะมาทำงานที่ method นี้นะจ๊ะ
  //บันทัดล่างนี้จะเป็นการใช้ axios ยิง request ไปโดยใช้ option ข้างบน มาเก็บไว้ในตัวแปร googletrenddata
  const googletrenddata = new Promise(async (resolve, reject) => {
    const response = await axios.request(options)
    const data = response.data
    const jsonObject = await xml2js.parseStringPromise(data)// data ที่ได้มา จะได้มาเป็น xml ก็เลยใช้ xml2js มาแปลงมันเป็น object
    const results = jsonObject.rss.channel[0].item

    // const descriptionArray = description.description[0].split(',');
    // const filteredDescription = descriptionArray.slice(0, 3);
    // const descriptionString = filteredDescription.join(', ');
      
    const filteredResults = results.map((item) => ({
      title : item.title[0],
      description : item.description[0].split(',').slice(0,3).join(', ')
    }))
// ผมมีปัญหากับ description เพราะมี requirement มาว่า บางที description มันเยอะมาก คั่นด้วย , ให้เอามาแค่ 3 ข้อมูลแรก ก็พอ
// แล้วก็พยายามจะทำ ไอ 3 คำสั่งที่ comment ไว้ แต่ ทำไม่เป็น เลยใช้แบบ chain มันแบบที่เห็นเลยละกัน
// ใครมีคำแนะนำว่าต้องทำยังไง ก็สอนผมด้วยละกันนะครับ
    resolve(filteredResults)
  })
  googletrenddata
  .then( async (result)=>{
  // ตรงนี้ก็ พอได้ข้อมูลจาก googletrendมาเรียบร้อย ก็จะมาทำงานใน <<ตัวแปร>>.then() เพราะ เรากำหนด googletrenddata ให้เป็น new Promise ไว้
  // จากตรงนี้ไป เป็น requirement ยิบย่อยเล็กน้อยนะครับ ลองไปไล่ๆ code กันดู
    const thDateStrine = new Date().toLocaleDateString('th-TH', {year:'2-digit', month:'short',day:'numeric'})
    const thTimetrine = new Date().toLocaleTimeString('th-TH', {hour:'2-digit'})
    let roundExpect = 0 //0-9
    
    while (roundExpect < 10) {
    let msgHeader = `10 อันดับ (${roundExpect +1} - ${roundExpect +5}) (${thDateStrine}, ${thTimetrine}:00 น.)`
      let mainContent = '';
      for (let index = 0; index < 5; index++) {
        const lineTitle = result[roundExpect].title
        const lineDesctiption = result[roundExpect].description ? ` (คำที่เกี่ยวข้อง ${result[roundExpect].description})` : ''
        mainContent += `${roundExpect +1}. ${lineTitle}${ lineDesctiption}` + "\n"
        roundExpect++
      }

      await axios({
        method: 'post',
        url: 'https://notify-api.line.me/api/notify',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer 8oufiXb8XQk61i0wGiVxnq6uQ5o22R42XDlFIKGQIY0`,
        },
        data: "message=" + msgHeader + "\n\n" + mainContent,
      })
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      })
    }
    res.status(200).send({ message: 'Success' });
  })
  .catch((err)=>{err})
})

app.get('/scrap',async (req, res) => {
  const url = "https://trends24.in/thailand/"
  const data = [];
  try {
    const response = await axios.get(url)
    .then(response => {
      const $ = cheerio.load(response.data);
      console.log('log');
      $('#trend-list > div.trend-card:first-child > .trend-card__list > li').each((index, element)=>{
        const tag = $(element).text()
        data.push({
          index, tag
        })
      });
      res.status(200).send({message: data})
    })
    .catch((err) => {
      if(err.response){
        console.error('error')
        console.error(err.response.data)
        console.error(err.response.status)
        console.error(err.response.header)
      }
    })
  } catch (err) {
    res.status(500).send({error: err})
  }
})

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
// 8oufiXb8XQk61i0wGiVxnq6uQ5o22R42XDlFIKGQIY0