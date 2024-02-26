import env from './dotenv.js'
import Agent from './agent/index.js'
import socket from './socket/index.js'

const gameMods = {
  6000: 'player',
  6001: 'coach',
  6002: 'trainer'
}

const port = process?.argv?.[2] ?? env.PORT
const teamName = process?.argv?.[3] ?? 'DefaultTeamName'
const agent = new Agent();
socket(agent, teamName, env.VERSION, port)
