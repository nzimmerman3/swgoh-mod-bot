const { Client, MessageEmbed } = require("discord.js")
const fetch = require('node-fetch')
const querystring = require('querystring')
const keepAlive = require('./server')
const fs = require('fs')

const client = new Client()
const prefix = '&'

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

async function calculateMod(ally) {
  const page = "https://swgoh.gg/api/players/" + ally +"/mods/"
  const page1 = "https://swgoh.gg/api/player/" + ally
  const data = await fetch(page).then(response => response.json());
  const data1 = await fetch(page1).then(response => response.json());

  const gp = data1["data"]["character_galactic_power"]
  var modData = data["mods"]
  var numMods = data["count"]
  var name = data1["data"]["name"]

  var mods = []
  var ten = 0
  var fifteen = 0
  var twenty = 0
  var twentyfive = 0

  modData.forEach((mod) => {
    var primary = mod["primary_stat"]["name"];
    var speed = 0;
    mod["secondary_stats"].forEach(stat => {
      if (stat["name"] === "Speed") {
        speed = stat["value"] / 10000
        if (speed >= 10) {
          ten += 1;
          if (speed >= 15) {
            fifteen += 1;
            if (speed >= 20) {
              twenty += 1;
              if (speed >= 25) {
                twentyfive += 1;
              }
            }     
          }
        }
      }
    })
    mods.push([primary, speed])
  })
  return([name, fifteen, twenty, twentyfive, gp])
}

async function calculateScore(values) {
  const score = ((values[1] * .5) / (values[4] / 100000)) + ((values[2] * 1.5) / (values[4] / 100000)) + ((values[3] * 2) / (values[3] / 100000))
  return([values[0], score])
}

function callback() {
  return
}

client.on("message", async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  if (command === 'lookup') {
    const values = await calculateMod(args[0])
    const name = values[0]
    const fifteen = values[1]
    const twenty = values[2]
    const twentyfive = values[3]
    const gp = values[4]
    const url = 'https://swgoh.gg/p/' + args[0].toString()
    const oldScore = (fifteen) / (gp / 100000)
    const newScore = ((fifteen * .5) / (gp / 100000)) + ((twenty * 1.5) / (gp / 100000)) + ((twentyfive * 2) / (gp / 100000))
    const mess = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(name + '\'s Mod Report')
      .setURL(url)
      .addFields(
        { name:"Mod Quality", value: 'Mod Score.....................................' + oldScore.toFixed(2) + '\nNick\'s Score..................................'  + newScore.toFixed(2) },
      )
    message.channel.send(mess)
  }
  if (command === 'g-lookup') {
    const page = "https://swgoh.gg/api/guild/" + args[0] + "/"
    const data = await fetch(page).then(response => response.json());
    let results = []
    data["players"].forEach(async (player) => {
      const ally = player["data"]["ally_code"]
      const name = player["data"]["name"]
      // const values = await calculateMod(ally).then()
      // let result = await calculateScore(values)
      // console.log(values)
      // await results.push(result)
      await calculateMod(ally).then((values) => calculateScore(values)).then((result) => results.push(result))
    })
    let message = ""
    results.forEach((result) => {
      message += `${result[0]}..................................${result[1]}`
    })
    let mess = new MessageEmbed()
      .setColor('#0099ff')
      // .setTitle(name + '\'s Mod Report')
      // .setURL(url)
      .addFields(
        { name:"Mod Quality", value: message },
      )
    message.channel.send(mess)
  }
  if (command === 'guild') {
    const ApiSwgohHelp = require('api-swgoh-help');
    const swapi = new ApiSwgohHelp({
      "username":"nzimmerman3",
      "password":process.env['PASSWORD']
    });
    let acquiredToken = await swapi.connect()
    let payload = {"allycodes": ["146523987"]}

    // let { result, error, warning } = await swapi.fetchPlayer( payload );
    let { result, error, warning } = await swapi.fetchPlayer( payload );
    var json = JSON.stringify(result)
    console.log( result );
    fs.writeFile('player.json', json, 'utf8', callback)
  }
})

client.on('debug', console.log);


keepAlive()
client.login(process.env['TOKEN']).catch(console.error)