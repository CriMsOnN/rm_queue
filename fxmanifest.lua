fx_version 'cerulean'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

description 'RMCore is a roleplay framework for redm. Vite boilerplate used is from overextended'

name 'rm_core'
version '0.0.1'
license 'MIT'
author 'Cr1MsOn'

dependencies {
    '/onesync',
}

client_scripts {
    'build/client/*.js'
}

server_scripts {
    'build/server/*.js'
}

files {
    'adaptiveCard.json',
}
