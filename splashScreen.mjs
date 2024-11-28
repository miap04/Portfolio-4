import ANSI from "./utils/ANSI.mjs";

const outputGraphics = `
 ██▓    ▄▄▄       ▄▄▄▄ ▓██   ██▓ ██▀███   ██▓ ███▄    █ ▄▄▄█████▓ ██░ ██
▓██▒   ▒████▄    ▓█████▄▒██  ██▒▓██ ▒ ██▒▓██▒ ██ ▀█   █ ▓  ██▒ ▓▒▓██░ ██▒
▒██░   ▒██  ▀█▄  ▒██▒ ▄██▒██ ██░▓██ ░▄█ ▒▒██▒▓██  ▀█ ██▒▒ ▓██░ ▒░▒██▀▀██░
▒██░   ░██▄▄▄▄██ ▒██░█▀  ░ ▐██▓░▒██▀▀█▄  ░██░▓██▒  ▐▌██▒░ ▓██▓ ░ ░▓█ ░██
░██████▒▓█   ▓██▒░▓█  ▀█▓░ ██▒▓░░██▓ ▒██▒░██░▒██░   ▓██░  ▒██▒ ░ ░▓█▒░██▓
░ ▒░▓  ░▒▒   ▓▒█░░▒▓███▀▒ ██▒▒▒ ░ ▒▓ ░▒▓░░▓  ░ ▒░   ▒ ▒   ▒ ░░    ▒ ░░▒░▒
░ ░ ▒  ░ ▒   ▒▒ ░▒░▒   ░▓██ ░▒░   ░▒ ░ ▒░ ▒ ░░ ░░   ░ ▒░    ░     ▒ ░▒░ ░
  ░ ░    ░   ▒    ░    ░▒ ▒ ░░    ░░   ░  ▒ ░   ░   ░ ░   ░       ░  ░░ ░
    ░  ░     ░  ░ ░     ░ ░        ░      ░           ░           ░  ░  ░
                       ░░ ░
`;

class SplashScreen {

    constructor() {
        this.lines = outputGraphics.trim().split("\n");
        this.currentLine = this.lines.length - 1;
        this.dirty = true;
        this.intervalID = setInterval(() => this.printNextLine(), 200);
    }

    update() {
        if (this.currentLine > 0) {
            this.dirty = true;
        } else {
            clearInterval(this.intervalID);
        }
    }

    draw() {
        if (this.dirty) {
            this.dirty = false;
            console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
            for (let i = this.currentLine; i < this.lines.length; i++) {
                console.log(this.lines[i]);
            }
        }
    }

    printNextLine() {
        if (this.currentLine > 0) {
            this.dirty = true;
            this.currentLine--;
        } else {
            clearInterval(this.intervalID);
        }
    }
}

export default SplashScreen;