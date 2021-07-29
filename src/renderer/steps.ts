import Form from './form';
import { ipcRenderer } from 'electron';
import { SteamCMDStatus, IPCSteamCMDCommands } from '../ipc/protocol';

function setupFunction(): Array<Form>{
    const steamCmdForm = new Form({
        name: "steamcmd",
        button: document.getElementById("steamcmd-button"),
        messageContainer: document.getElementById("steamcmd-message"),
        errorContainer: document.getElementById("steamcmd-error"),
        inputs: null,
        disabled: false,
        buttonActionEnabled: (async () => {
            console.log("SteamCMD download request sent.");
            ipcRenderer.send("RUN_STEAMCMD_DOWNLOAD");
            return true;
        }),
        buttonActionDisabled: (async () => {
            console.log("disabled lol");
            return false;
        })
    });

    const csgoDownloadForm = new Form({
        name: "csgoDownload",
        button: document.getElementById("csgo-button"),
        messageContainer: document.getElementById("csgo-message"),
        errorContainer: document.getElementById("csgo-error"),
        inputs: null,
        disabled: true,
        buttonActionEnabled: (async () => {
            console.log("CS:GO download request sent.");
            ipcRenderer.send("RUN_CSGO_DOWNLOAD");
            return true;
        }),
        buttonActionDisabled: (async () => {
            console.log("disabled lol");
            return false;
        })
    });

    return [steamCmdForm, csgoDownloadForm];
}

interface StepManagerConfig{
    setup: () => Array<Form>;
}

class StepManager{
    container: Element;
    forms: Array<Form>;
    steamCmdStatus: SteamCMDStatus;
    setup: () => Array<Form>;

    constructor(config: StepManagerConfig){
        this.setup = config.setup;
    }

    run(): void{
        this.forms = this.setup();
        this.applyListenersOnForms();
    }

    applyListenersOnForms(): void{
        ipcRenderer.on(IPCSteamCMDCommands.STEAMCMD_STATUS_UPDATE, this.statusUpdateHandler.bind(this));
        ipcRenderer.on(IPCSteamCMDCommands.STEAMCMD_MESSAGE_UPDATE, this.steamCmdMessageUpdateHandler.bind(this));  
        ipcRenderer.on(IPCSteamCMDCommands.CSGO_STEAMCMD_MESSAGE_UPDATE, this.csgoSteamCmdMessageUpdateHandler.bind(this));  
    }

    statusUpdateHandler(event: any, status: SteamCMDStatus): void {
        this.steamCmdStatus = status;

        switch(status){
            case SteamCMDStatus.INITIALIZE:
                this.findFormByName("steamcmd").setButtonDisabled(true);
            break;

            case SteamCMDStatus.STEAMCMD_FINISHED:
                this.findFormByName("steamcmd").setButtonDisabled(true);
                this.findFormByName("steamcmd").setButtonText("Finished");
                this.findFormByName("csgoDownload").setButtonDisabled(false);
            break;

            case SteamCMDStatus.CSGODOWNLOAD:
                this.findFormByName("csgoDownload").setButtonDisabled(true);
                this.findFormByName("csgoDownload").setButtonText("In progress...");
            break;

            case SteamCMDStatus.CSGO_FINISHED:
                this.findFormByName("csgoDownload").setButtonDisabled(false);
                this.findFormByName("csgoDownload").setButtonText("Update & verify");
            break;
        }
    }

    steamCmdMessageUpdateHandler(event: any, message: string): void {
        this.findFormByName("steamcmd").setMessage(message);
    }

    csgoSteamCmdMessageUpdateHandler(event: any, message: string): void {
        this.findFormByName("csgoDownload").setMessage(message);
    }

    findFormByName(formName: string): Form {
        let res: Form;
        for(const form of this.forms){
            if(form.name == formName){
                res = form;
            }
        }

        return res;
    }
}

export default new StepManager({
    setup: setupFunction,
});