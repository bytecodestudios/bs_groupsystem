fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Cadburry & Guardian & Snappy (Bytecode Studios)'
description 'Group System with tasks list'
version '0.6'

shared_script {
    '@ox_lib/init.lua',
    'types.lua',
    'config.lua',
}

client_script {
    'modules/utils/client.lua',
    'bridge/**/client/*.lua',
    'bridge/**/client.lua',
    'modules/nui_extended/client.lua',
    'modules/**/client.lua',
}

server_scripts {
    'modules/utils/server.lua',
    'bridge/**/server/*.lua',
    'bridge/**/server.lua',
    'modules/nui_extended/server.lua',
    'modules/**/server.lua',
}

ui_page 'web/index.html'

files {
    'web/index.html',
    'web/**/*',
    'locales/*.json'
}

dependencies {
    'ox_lib'
}

escrow_ignore {
    'bridge/**/**/*',
    'types.lua',
    'config.lua'
}