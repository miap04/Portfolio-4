import Labyrinth from "./labyrint.mjs";
import ANSI from "./utils/ANSI.mjs";
import SplashScreen from "./splashScreen.mjs";

const REFRESH_RATE = 50;
const SPLASH_SCREEN_DURATION = 3000;

console.log(ANSI.RESET, ANSI.CLEAR_SCREEN, ANSI.HIDE_CURSOR);

let intervalID = null;
let isBlocked = false;
let state = null;

function init() {
    state = new SplashScreen();
    intervalID = setInterval(update, REFRESH_RATE);
    setTimeout(() => {
        clearInterval(intervalID);
        state = new Labyrinth();
        intervalID = setInterval(update, REFRESH_RATE);
    }, SPLASH_SCREEN_DURATION);
}

function update() {
    if (isBlocked) { return; }
    isBlocked = true;
    state.update();
    state.draw();
    isBlocked = false;
}

init();