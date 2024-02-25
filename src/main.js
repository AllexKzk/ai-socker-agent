import env from './dotenv.js'
import Agent from './agent/index.js'
import socket from './socket/index.js'
import readline from 'readline'

const gameMods = {
  6000: 'player',
  6001: 'coach',
  6002: 'trainer'
}

const port = process?.argv?.[2] ?? env.PORT
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('teamName: ', (teamName) => {
  const agent = new Agent();
  socket(agent, teamName, env.VERSION, port)
})
