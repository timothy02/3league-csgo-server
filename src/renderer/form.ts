interface FormConfig{
    button: Element;
    name: string,
    inputs: Array<Element> | null;
    disabled?: boolean;
    messageContainer: Element;
    errorContainer: Element;
    buttonActionEnabled?: () => Promise<boolean | string> | null;
    buttonActionDisabled: () => Promise<boolean | string> | null;
}

export default class Form {
    buttonActionEnabled: () => Promise<boolean | string> | null;
    buttonActionDisabled: () => Promise<boolean | string> | null;
    button: Element;
    name: string;
    messageContainer: Element;
    errorContainer: Element;
    inputs: Array<Element>;
    message: string | null;
    error: string | null;
    disabled: boolean;

    constructor(config: FormConfig){
        this.button = config.button;
        this.name = config.name;
        this.messageContainer = config.messageContainer;
        this.errorContainer = config.errorContainer;
        this.inputs = config.inputs;
        this.disabled = (config.disabled != null && config.disabled != undefined) ? config.disabled : true;
        this.buttonActionEnabled = config.buttonActionEnabled ? config.buttonActionEnabled : null;
        this.buttonActionDisabled = config.buttonActionDisabled ? config.buttonActionDisabled : null;

        console.log(this.button)
        this.applyEventListenersToButton();
    }

    applyEventListenersToButton(){
        this.button.addEventListener("click", (e) => {
            e.preventDefault();

            if(this.disabled){
                this.buttonActionDisabled();
            } else {
                this.buttonActionEnabled();
            }
        });
    }

    setMessage(message: string){
        this.message = message;
        this.messageContainer.innerHTML = this.message;
    }

    setButtonDisabled(disabled: boolean){
        this.disabled = disabled;
        
        if(disabled){
            this.button.classList.add("disabled");
        } else {
            this.button.classList.remove("disabled");
        }
    }

    setButtonText(text: string){
        this.button.innerHTML = text;
    }
}