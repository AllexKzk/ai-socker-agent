import env from './dotenv.js'
import Agent from './agent/index.js'
import socket from './socket/index.js'

const teamName = 'teamA'
const agent = new Agent();
socket(agent, teamName, env.VERSION)