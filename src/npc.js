import * as constant from "./constant";

export const NPC_DEFINITION = {
    '夜九年': {
        'image': constant.POCKETROSE_DOMAIN + '/image/head/1561.gif',
        'intro': ''
    },
    '夜苍凉': {
        'image': constant.POCKETROSE_DOMAIN + '/image/head/1117.gif',
        'intro': ''
    },
    '青鸟': {
        'image': constant.POCKETROSE_DOMAIN + '/image/head/7184.gif',
        'intro': ''
    },
    '末末': {
        'image': constant.POCKETROSE_DOMAIN + '/image/head/8173.gif',
        'intro': ''
    },
    '白皇': {
        'image': constant.POCKETROSE_DOMAIN + '/image/head/11134.gif',
        'intro': ''
    },
    '七七': {
        'image': constant.POCKETROSE_DOMAIN + '/image/head/1368.gif',
        'intro': ''
    },
    '妮可': {
        'image': constant.POCKETROSE_DOMAIN + '/image/head/4237.gif',
        'intro': ''
    },
    '花子': {
        'image': constant.POCKETROSE_DOMAIN + '/image/head/1126.gif',
        'intro': ''
    }
};

export function getNPC(name) {
    return NPC_DEFINITION[name];
}