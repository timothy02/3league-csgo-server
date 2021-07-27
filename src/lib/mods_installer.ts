import * as fs from 'fs';
import * as path from 'path';
import * as anzip from 'anzip';
import * as EventEmmiter from 'events';
import * as mv from 'mv';

enum ModInstallerStatus {
    MODSINSTALLING = "MODS INSTALALLING",
    MODSENABLING = "MODS ENABLING",
    FINISHED = "FINISHED",
    ERROR = "ERROR"
}

interface ModInstallerConfig {
    csgoPath: string;
    modsDir: string;
    modInstallList: Array<string>;
    modEnableList: Array<string>;
}

export default class ModInstaller extends EventEmmiter{
    modsDir: string;
    modInstallList: Array<string>;
    modEnableList: Array<string>;
    csgoPath: string;

    constructor(config: ModInstallerConfig){
        super();

        this.csgoPath = config.csgoPath;
        this.modsDir = path.resolve(__dirname, "../../", config.modsDir);
        this.modInstallList = config.modInstallList;
        this.modEnableList = config.modEnableList;
    }

    emitStatus(status: ModInstallerStatus){
        this.emit("status", status);
    }

    logMessage(message: string){
        this.emit("message", message);
    }

    logError(error: any){
        this.emit("error", error);
    }

    async installMods(){
        try{
            this.emitStatus(ModInstallerStatus.MODSINSTALLING);
            await this.unzipMods();
            this.emitStatus(ModInstallerStatus.MODSENABLING);
            await this.enableMods();
            this.emitStatus(ModInstallerStatus.FINISHED);
        }catch(e){
            this.emitStatus(ModInstallerStatus.ERROR);
            this.logError(e);
        }
    }
        
    async unzipMods(){
        try{
            for(const mod of this.modInstallList){
                const modPath = path.join(this.modsDir, mod+".zip");

                await anzip(modPath, {
                    outputPath: this.csgoPath,
                });

                this.logMessage(`Mod: ${mod} installed.`);
            };
        } catch(e){
            this.logError(e);
        }
    }

    async enableMods(){
        const startPath = path.join(this.csgoPath, "addons/sourcemod/plugins/disabled");
        const endPath = path.join(this.csgoPath, "addons/sourcemod/plugins");

        for(const mod of this.modEnableList){
            const filePathStart = path.join(startPath, mod + ".smx");
            const filePathEnd = path.join(endPath, mod + ".smx");
            
            await this.moveModFile(filePathStart, filePathEnd);

            this.logMessage(`Sourcemod: ${mod} enabled.`);
        };
    }

    moveModFile(from: string, to: string): Promise<any>{
        return new Promise((resolve, reject) => {
            mv(from, to, (error: any) => {
                if(error) reject(error);

                resolve(true);
            });
        });
    }
}