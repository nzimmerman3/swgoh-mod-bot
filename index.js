const { Client, MessageEmbed } = require("discord.js")
const fetch = require('node-fetch')
const querystring = require('querystring')
const keepAlive = require('./server')

const client = new Client()
const prefix = '&'

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'lookup') {
    const page = "https://swgoh.gg/api/players/" + args[0] +"/mods/"
    const page1 = "https://swgoh.gg/api/player/" + args[0]
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
  var oldScore = (fifteen) / (gp / 100000)
  var newScore = ((fifteen * .5) / (gp / 100000)) + ((twenty * 1.5) / (gp / 100000)) + ((twentyfive * 2) / (gp / 100000))
  const mess = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Mod Report')
    .addFields(
      { name: 'Mod Score', value: oldScore.toFixed(2), inline: true },
      { name: 'Nick\'s Score', value: newScore.toFixed(2), inline: true }
    )
  // message.channel.send(`Mod Score: ${oldScore.toFixed(2)}\nNew Mod Score: ${newScore.toFixed(2)}`);
  message.channel.send(mess)
  }
})

keepAlive();
client.login(process.env['TOKEN'])