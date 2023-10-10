var express = require("express")
var app = express()
const xml2js = require('xml2js')
const axios = require('axios')
const cheerio = require('cheerio')
const dotenv = require('dotenv')
const linenoti = require('./linenotify')
const options = {
  method: 'GET',
  url: `https://trends.google.com/trends/trendingsearches/daily/rss?geo=TH`,
  header: {
    'X-RapidAPI-Host': `trends.google.com`
  }
}

dotenv.config()

const tokens = [ process.env.TOKEN_FOR_MY_TEST, process.env.TOKEN_FOR_DGTL_STG]


app.get("/", (req, res) => {
  const thDateStrine = new Date().toLocaleDateString('th-TH', {year:'2-digit', month:'short',day:'numeric'})
  const thTimetrine = new Date().toLocaleTimeString('th-TH', {hour:'2-digit'})
  const googletrenddata = new Promise(async (resolve, reject) => {
    const response = await axios.request(options)
    const jsonObject = await xml2js.parseStringPromise(response.data)
    const filteredResults = jsonObject.rss.channel[0].item.map((item) => ({
      title : item.title[0],
      description : item.description[0].split(',').slice(0,3).join(', ')
    }))

    resolve(filteredResults)
  })
  googletrenddata
  .then( async (result)=>{
    const setData = [result.slice(0,5), result.slice(5,10)] // แบ่ง set data เป็น [1-5, 6-10]
    let dataNumber = 0
    let messageArr = [];
    for (let round = 0; round < setData.length; round++) { //loop 2 รอบ ตามสมาชิก setData
      let msgHeader = `10 อันดับ (${dataNumber +1} - ${dataNumber +5}) (${thDateStrine}, ${thTimetrine}:00 น. ส่งเทสต์แบบหลายกลุ่มครับ )`
      const dataInSet = setData[round]
      let lineMessage = ''
      dataInSet.forEach((trendData) => { // loop ตามสมาชิกภายใน array setData 1-5 หรือ 6-10
        const title = trendData.title
        const desc = trendData.description ? `(คำที่เกี่ยวข้อง ${trendData.description})` : ''
        lineMessage += `${++dataNumber}. ${title} ${desc}` + "\n";
      });
      messageArr.push(msgHeader + "\n\n" + lineMessage)
    }
    tokens.forEach(async lineToken => {
      await linenoti.sendmessage(messageArr[0], lineToken)
      await linenoti.sendmessage(messageArr[1], lineToken)
    });
    
    res.status(200).send({ message: 'Success' });
  })
  .catch((err)=>{err})
})

app.listen(process.env.PORT, () => {
  console.log(`server listening on port ${process.env.PORT}`);
});