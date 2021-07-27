import SteamCMD from '../src/lib/steamcmd';
import { expect } from 'chai';
import * as path from 'path';
import * as fs from 'fs';

describe("SteamCMD class tests", () =>{
    const defaultConfig = {
        downloadDir: "temp",
        installDir: "steam",
        baseDir: "server",
        steamCmdUrl: "http://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip",
        scriptsDir: "server_assets/scripts",
        modsDir: "server_assets/mods",
        modInstallList: ["sourcemod", "metamod", "get5", "steamworks"],
        modEnableList: ["get5_apistats"],
    }
    const steamCmd = new SteamCMD(defaultConfig);

    after(() => {
       fs.rmdirSync(steamCmd.baseDir, { recursive: true });
    });

    it("should be a instance of SteamCMD", () => {
        expect(steamCmd).to.be.an.instanceof(SteamCMD);
    });

    it("paths should be definite", () => {
        expect(steamCmd.baseDir).to.equal(path.resolve(__dirname, '../', defaultConfig.baseDir));
        expect(steamCmd.downloadDir).to.equal(path.resolve(__dirname, '../', defaultConfig.baseDir, defaultConfig.downloadDir));
        expect(steamCmd.installDir).to.equal(path.resolve(__dirname, '../', defaultConfig.baseDir, defaultConfig.installDir));
        expect(steamCmd.scriptsDir).to.equal(path.resolve(__dirname, '../', defaultConfig.scriptsDir));
    });

    describe("logMessage()", () => {
        it("should emmit a message", ()=> {
            const testMessage = "This is a test";

            steamCmd.once("message", (msg) => {
                expect(msg).to.be.a("string");
                expect(msg).to.equal(testMessage);
            });

            steamCmd.logMessage(testMessage);
        });
    });

    describe("prepareDirectories()", () => {
        it("should create folders", async () => {
            await steamCmd.prepareDirectories();

            expect(fs.existsSync(steamCmd.baseDir)).to.equal(true);
            expect(fs.existsSync(steamCmd.downloadDir)).to.equal(true);
            expect(fs.existsSync(steamCmd.installDir)).to.equal(true);
        });

        it("should send messages with info about creating", async () => {
            const listener = (msg: string) => {
                expect(msg).to.be.a("string");
            };

            steamCmd.addListener("message", listener);
            await steamCmd.prepareDirectories();
            steamCmd.removeListener("message", listener);
        });
    });

    describe("downloadSteamCMD()", () => {
        it("should download SteamCMD", async () => {
            await steamCmd.downloadSteamCmd();

            expect(fs.existsSync(path.join(steamCmd.downloadDir, "steamcmd.zip"))).to.equal(true);
        });
    });

    describe("unpackSteamCmd()", () => {
        it("should unpack zip to folder", async () => {
            await steamCmd.unpackSteamCmd();

            expect(fs.existsSync(path.join(steamCmd.installDir, "steamcmd.exe"))).to.equal(true);
        });
    });

    describe("loadSteamCmdScripts()", () => {
        it("should move install script to instalation folder", async () => {
            await steamCmd.loadSteamCmdScripts();

            expect(fs.existsSync(path.join(steamCmd.installDir, "csgo_script.txt"))).to.equal(true);
        });
    });

    /*describe("run and stop sequence", () => {
        it("should run and set 4 statuses", async () => {
            let counter = 0;
            const listener = (status: SteamCMDStatus) => {
                counter++;
            }
            
            steamCmd.addListener("status", listener);
            steamCmd.setup();

            setTimeout(() => {
                expect(counter).to.equal(4);
            }, 5000);

            steamCmd.removeListener("status", listener);
        });
    });*/
});