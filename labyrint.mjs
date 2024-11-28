import ANSI from "./utils/ANSI.mjs";
import KeyBoardManager from "./utils/KeyBoardManager.mjs";
import { readMapFile, readRecordFile } from "./utils/fileHelpers.mjs";
import * as CONST from "./constants.mjs";


const startingLevel = CONST.START_LEVEL_ID;
const secondLevel = CONST.SECOND_LEVEL_ID;
const thirdLevel = CONST.THIRD_LEVEL_ID;
const levels = loadLevelListings();

let currentLevel = startingLevel;

function loadLevelListings(source = CONST.LEVEL_LISTING_FILE) {
    let data = readRecordFile(source);
    let levels = {};
    for (const item of data) {
        let keyValue = item.split(":");
        if (keyValue.length >= 2) {
            let key = keyValue[0];
            let value = keyValue[1];
            levels[key] = value;
        }
    }
    return levels;
}

let levelData = readMapFile(levels[startingLevel]);
let level = levelData;

let pallet = {
    "█": ANSI.COLOR.LIGHT_GRAY,
    "H": ANSI.COLOR.RED,
    "$": ANSI.COLOR.YELLOW,
    "B": ANSI.COLOR.GREEN,
}


let isDirty = true;

let playerPos = {
    row: null,
    col: null,
}

const EMPTY = " ";
const HERO = "H";
const LOOT = "$"
const TELEPORTER = "T";
const NPC = "X";
const NEXTDOOR = "D";
const BACKDOOR = "S";

let direction = -1;

let items = [];

const THINGS = [LOOT, EMPTY, NEXTDOOR, TELEPORTER, BACKDOOR];

let eventText = "";

const HP_MAX = 10;

const playerStats = {
    hp: 8,
    chash: 0
}

class Labyrinth {

    update() {

        if (playerPos.row == null) {
            for (let row = 0; row < level.length; row++) {
                for (let col = 0; col < level[row].length; col++) {
                    if (level[row][col] == "H") {
                        playerPos.row = row;
                        playerPos.col = col;
                        break;
                    }
                }
                if (playerPos.row != undefined) {
                    break;
                }
            }
        }

        let drow = 0;
        let dcol = 0;

        if (KeyBoardManager.isUpPressed()) {
            drow = -1;
        } else if (KeyBoardManager.isDownPressed()) {
            drow = 1;
        }

        if (KeyBoardManager.isLeftPressed()) {
            dcol = -1;
        } else if (KeyBoardManager.isRightPressed()) {
            dcol = 1;
        }

        let tRow = playerPos.row + (1 * drow);
        let tcol = playerPos.col + (1 * dcol);

        if (THINGS.includes(level[tRow][tcol])) {

            let currentItem = level[tRow][tcol];
            if (currentItem == LOOT) {
                let loot = Math.round(Math.random() * 7) + 3;
                playerStats.chash += loot;
                eventText = `Player gained ${loot}$`;
            }
            else if (currentItem == NEXTDOOR) {
                swapNextLevel();
                return;
            }
            else if (currentItem == TELEPORTER) {
                teleport(tRow, tcol);
                return;
            }
            else if (currentItem == BACKDOOR) {
                swapPreviousLevel();
                return;
            }
            level[playerPos.row][playerPos.col] = EMPTY;
            level[tRow][tcol] = HERO;


            playerPos.row = tRow;
            playerPos.col = tcol;


            isDirty = true;
        } else {
            direction *= -1;
        }
        patrolNPCs();
    }

    draw() {

        if (isDirty == false) {
            return;
        }
        isDirty = false;

        console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);

        let rendring = "";

        rendring += renderHud();

        for (let row = 0; row < level.length; row++) {
            let rowRendering = "";
            for (let col = 0; col < level[row].length; col++) {
                let symbol = level[row][col];
                if (pallet[symbol] != undefined) {
                    rowRendering += pallet[symbol] + symbol + ANSI.COLOR_RESET;
                } else {
                    rowRendering += symbol;
                }
            }
            rowRendering += "\n";
            rendring += rowRendering;
        }

        console.log(rendring);
        if (eventText != "") {
            console.log(eventText);
            eventText = "";
        }
        console.log("H = Hero, $ = Cash");
        console.log("D = Next level, S = Previous level");
        console.log("X = NPC, T = Teleporter");
    }
}

function renderHud() {
    let hpBar = `Life:[${ANSI.COLOR.RED + pad(playerStats.hp, "♥︎") + ANSI.COLOR_RESET}${ANSI.COLOR.LIGHT_GRAY + pad(HP_MAX - playerStats.hp, "♥︎") + ANSI.COLOR_RESET}]`
    let cash = `$:${playerStats.chash}`;
    return `${hpBar} ${cash}\n`;
}

function pad(len, text) {
    let output = "";
    for (let i = 0; i < len; i++) {
        output += text;
    }
    return output;
}
function swapNextLevel() {
    if (currentLevel == startingLevel) {
        currentLevel = secondLevel;
    } else if (currentLevel == secondLevel) {
        currentLevel = thirdLevel;
    } else if (currentLevel == thirdLevel) {
        eventText = "Finished the game!";
        return;
    }
    levelData = readMapFile(levels[currentLevel]);
    level = levelData;
    playerPos.row = null;
    playerPos.col = null;
    eventText = `Swapped to level: ${currentLevel}`;
}

function swapPreviousLevel() {
    if (currentLevel == secondLevel) {
        currentLevel = startingLevel;
    } else if (currentLevel == thirdLevel) {
        currentLevel = secondLevel;
    }
    levelData = readMapFile(levels[currentLevel]);
    level = levelData;
    playerPos.row = null;
    playerPos.col = null;
    eventText = `Swapped to level: ${currentLevel}`;
}


function patrolNPCs() {
    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            if (level[row][col] == NPC) {
                let drow = Math.floor(Math.random() * 3) - 1;
                let dcol = Math.floor(Math.random() * 3) - 1;
                let tRow = row + drow;
                let tCol = col + dcol;
                if (tRow >= 0 && tRow < level.length && tCol >= 0 && tCol < level[0].length) {
                    if (level[tRow][tCol] == EMPTY) {
                        level[row][col] = EMPTY;
                        level[tRow][tCol] = NPC;
                    }
                }
            }
        }
    }
}
function teleport(tRow, tcol) {
    let found = false;
    for (let row = 0; row < level.length; row++) {
        for (let col = 0; col < level[row].length; col++) {
            if (level[row][col] == TELEPORTER && (row != tRow || col != tcol)) {
                level[playerPos.row][playerPos.col] = EMPTY;
                playerPos.row = row;
                playerPos.col = col;
                level[playerPos.row][playerPos.col] = HERO;
                eventText = "Teleported!";
                found = true;
                break;
            }
        }
        if (found) {
            break;
        }
    }
}

export default Labyrinth;