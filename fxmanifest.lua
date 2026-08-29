fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Cadburry & Guardian & Snappy (Bytecode Studios)'
description 'Group System with tasks list'
version '0.8'

shared_script {
    '@ox_lib/init.lua',
    'types.lua',
    'config.lua',
}

client_scripts {
    'bridge/framework/client.lua',
    'bridge/inventory/client.lua',
    'bridge/compat/client.lua',
    'bridge/apps/manager.lua',
    'bridge/apps/kartik.lua',
    'bridge/apps/sd-phone.lua',
    'modules/group/client.lua',
    'modules/blips/client.lua',
    'modules/nui/client.lua',
}

server_scripts {
    'modules/utils/server.lua',
    'bridge/framework/server.lua',
    'bridge/inventory/server.lua',
    'bridge/logger/server.lua',
    'bridge/compat/server.lua',
    'modules/group/server.lua',
    'modules/blips/server.lua',
    'modules/nui/server.lua',
}

ui_page 'web/index.html'

files {
    'web/index.html',
    'web/**/*',
    'locales/*.json'
}

provide 'bd-groups'
provide 'ps-playergroups'

dependencies {
    'ox_lib'
}