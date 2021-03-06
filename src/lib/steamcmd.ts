import http from 'http';
import fs from 'fs';
import path from 'path';
import anzip from 'anzip';
import { spawn } from 'child_process';
import EventEmmiter from 'events';
import { SteamCMDStatus } from '../ipc/protocol';


interface SteamCMDConfig {
    baseDir: string;
    downloadDir: string;
    installDir: string;
    scriptsDir: string;
}

async function createIfDoesntExist(dirname: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        try{
            if(fs.existsSync(dirname)){
                resolve(`Directory ${dirname} exists. All good.`);
            } else {
                fs.mkdirSync(dirname);
                resolve(`Directory ${dirname} doesn't exist. Creating new one.`);
            }
        } catch(e) {
            reject(e);
        }
    });
} 

export default class SteamCMD extends EventEmmiter{
    steamCmdUrl = "http://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip";
    baseDir: string;
    downloadDir: string;
    installDir: string;
    scriptsDir: string;
    steamCmdProcess: any;

    constructor(config: SteamCMDConfig){
        super();

        this.baseDir = path.resolve(__dirname, "../../", config.baseDir);
        this.downloadDir = path.resolve(config.baseDir, config.downloadDir);
        this.installDir = path.resolve(config.baseDir, config.installDir);
        this.scriptsDir = path.resolve(__dirname, "../../", config.scriptsDir);
    }

    async steamCmdSetup(){
        try{
            this.emitStatus(SteamCMDStatus.INITIALIZE);
            await this.prepareDirectories();
            this.emitStatus(SteamCMDStatus.STEAMCMDSETUP);
            await this.downloadSteamCmd();
            await this.unpackSteamCmd(); 
            await this.loadSteamCmdScripts(); 
            this.emitStatus(SteamCMDStatus.STEAMCMD_FINISHED);
            this.logMessage("SteamCMD downloaded successfully.");
        }catch(e){
            this.emitStatus(SteamCMDStatus.ERROR);
            this.logError(e);
        }
    }

    async csgoSetup(){
        try{
            this.emitStatus(SteamCMDStatus.CSGODOWNLOAD);
            await this.runSteamCmd();
            this.emitStatus(SteamCMDStatus.CSGO_FINISHED);
        }catch(e){
            this.emitStatus(SteamCMDStatus.ERROR);
            this.logError(e);
        }
    }

    emitStatus(status: SteamCMDStatus){
        this.emit("status", status);
    }

    logMessage(message: string){
        this.emit("message", message);
    }

    logError(error: any){
        this.emit("error", error);
    }

    async prepareDirectories(){
        const baseDirStatus = await createIfDoesntExist(this.baseDir);
        this.logMessage(baseDirStatus);

        const downloadDirStatus = await createIfDoesntExist(this.downloadDir);
        this.logMessage(downloadDirStatus);

        const installDirStatus = await createIfDoesntExist(this.installDir);
        this.logMessage(installDirStatus);
    }

    async downloadSteamCmd(): Promise<void>{
        return new Promise((resolve, reject) => {
            if(fs.existsSync(path.join(this.downloadDir, "steamcmd.zip"))){
                this.logMessage("SteamCMD already downloaded. Skipping.");
                resolve();
            } else {
                this.logMessage("SteamCMD doesn't exists. Downloading.");
        
                var file = fs.createWriteStream(path.join(this.downloadDir, "steamcmd.zip"));
        
                http.get(this.steamCmdUrl, (response: any) => {
                    response.pipe(file);
            
                    file.on("finish", () => {
                        this.logMessage("SteamCMD download finished.");
                        resolve();
                    });
                    file.on("error", (e) => {
                        this.logError(e);
                        reject();
                    });
                });
            }
        });
    }

    async unpackSteamCmd(){
        try{
            if(fs.existsSync(path.join(this.installDir, "steamcmd.exe"))){
                this.logMessage("SteamCMD already extracted. Skipping.");
            } else {
                this.logMessage("Starting to unzip the SteamCmd");

                const file = await anzip(path.join(this.downloadDir, "steamcmd.zip"), {
                    outputPath: this.installDir,
                });
            
                this.logMessage("SteamCmd extracted.");
                return file;

            } 
        } catch(e){
            this.logError(e);
            return e;
        }
    }

    async loadSteamCmdScripts(): Promise<string>{
        return new Promise((resolve, reject) => {
            if(!fs.existsSync(this.scriptsDir)){
                reject("Scripts folder doesn't exist.");
            } else {
                fs.readdir(this.scriptsDir, (err, files) => {
                    if(err) reject(err);

                    files.forEach(file => {
                        fs.copyFileSync(path.join(this.scriptsDir, file), path.join(this.installDir, file));
                            this.logMessage(`Moved ${file} script.`)
                    });

                    resolve("Files moved");
                });
            }
        });
    }

    async runSteamCmd(): Promise<void>{
        return new Promise((resolve, reject) => { 
            this.logMessage("CS:GO download started. Please wait it might take up to 15 minutes.");

            this.steamCmdProcess = spawn(path.join(this.installDir, "steamcmd.exe"), ["+runscript", "csgo_script.txt"],{
                stdio: 'pipe',
                shell: true
            });
    
            this.steamCmdProcess.stdout.on("data", (data: any) => {
                const message = data.toString();
                const progressRegex = /[0-9][0-9]\.[0-9][0-9]/gm;

                if(message.includes("OK")){
                    this.logMessage("CS:GO download started. Please wait it might take up to 15 minutes.");
                } else if(message.includes("downloading")){
                    let matches = message.match(progressRegex);
                    this.logMessage(`Download progress: ${matches[matches.length-1]}% Please note it's uptaded once in a while.`);
                } else {
                    this.logMessage(data.toString());
                }
            })
            
            this.steamCmdProcess.stdout.on("error", (error: any) => {
                reject();
                this.logError("err" + error.toString());
            });
    
            this.steamCmdProcess.stdout.on("end", () => {
                resolve();
                this.logMessage("CS:GO downloaded successfully.");
            });
    
            this.steamCmdProcess.stdout.on("close", () => {
                this.logMessage("STEAMCMD CLOSE");
            });
        });
    }

    stopSteamCmd(){
        this.steamCmdProcess.kill();
        this.emitStatus(SteamCMDStatus.CANCELLED);
    }
}











