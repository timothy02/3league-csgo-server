import ModInstaller from '../src/lib/mods_installer';
import { expect } from 'chai';
import * as path from 'path';
import * as fs from 'fs';

describe("ModsInstaller class tests", () =>{
    const defaultConfig = {
        csgoPath: path.resolve(__dirname, "../server1/steam/csgo/csgo"),
        modsDir: "server_assets/mods",
        modInstallList: ["sourcemod", "metamod", "get5", "steamworks"],
        modEnableList: ["get5_apistats"],
    }
    const modInstaller = new ModInstaller(defaultConfig);

    const basePath = path.resolve(__dirname, "../");
    const folders = [
        "server1",
        "steam",
        "csgo",
        "csgo",
        "addons",
        "sourcemod",
        "plugins",
        "disabled"
    ];
    const modPath = path.join(basePath, folders[0], folders[1], folders[2], folders[3]);

    before(() => {
        let checkPath;

        for(let i=0; i<folders.length; i++){
            if(i == 0){
                checkPath = path.join(basePath, folders[i]);
            } else{
                checkPath = path.join(checkPath, folders[i]);
            }

            if(!fs.existsSync(checkPath)) fs.mkdirSync(checkPath);
        }
    });

    after(() => {
       fs.rmdirSync(path.resolve(basePath, folders[0]), { recursive: true });
    });

    it("should be a instance of ModInstaller", () => {
        expect(modInstaller).to.be.an.instanceof(ModInstaller);
    });

    it("config should be set up", () => {
        expect(modInstaller.csgoPath).to.equal(defaultConfig.csgoPath);
        expect(modInstaller.modsDir).to.equal(path.resolve(__dirname, '../', defaultConfig.modsDir));
        expect(modInstaller.modInstallList).to.deep.equal(defaultConfig.modInstallList);
        expect(modInstaller.modEnableList).to.deep.equal(defaultConfig.modEnableList);
    });

    describe("logMessage()", () => {
        it("should emmit a message", ()=> {
            const testMessage = "This is a test";

            modInstaller.once("message", (msg) => {
                expect(msg).to.be.a("string");
                expect(msg).to.equal(testMessage);
            });

            modInstaller.logMessage(testMessage);
        });
    });

    describe("unzipMods()", () => {
        it("should unpack mods in csgo folder", async () => {
            await modInstaller.unzipMods();

            expect(fs.existsSync(path.join(modPath, "addons/sourcemod"))).to.equal(true);
            expect(fs.existsSync(path.join(modPath, "addons/metamod"))).to.equal(true);
            expect(fs.existsSync(path.join(modPath, "addons/sourcemod/plugins/get5.smx"))).to.equal(true);
            expect(fs.existsSync(path.join(modPath, "addons/sourcemod/extensions/SteamWorks.ext.dll"))).to.equal(true);
        });
    });

    describe("enableMods()", () => {
        it("should move mods that needs to be enabled", async () => {
            await modInstaller.enableMods();
            
            expect(fs.existsSync(path.join(modPath, "addons/sourcemod/plugins/get5_apistats.smx"))).to.equal(true);
            expect(fs.existsSync(path.join(modPath, "addons/sourcemod/plugins/disabled/get5_apistats.smx"))).to.equal(false);
        });
    });
});