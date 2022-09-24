fx_version 'cerulean'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

description 'RMQueue a basic implementation of a queue system for RedM'

name 'rm_queue'
version '0.0.1'
license 'MIT'
author 'Cr1MsOn'

client_scripts {
    'build/client/*.js'
}

server_scripts {
    'build/server/*.js',
    'server.lua'
}

files {
    'config.json',
    'adaptiveCard.json',
}
