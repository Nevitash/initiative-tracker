import { requestUrl, Setting } from "obsidian";
import type InitiativeTracker from "src/main";
import { Creature } from "src/utils/creature";

let step: number = 0;

export interface ApiSettings {
    webhook: string;
    toggleShow: boolean;
}

interface WebhookRequest {
    step: number;
    order: Creature[];
}

export function displayApi(
    initiativeTracker: InitiativeTracker,
    container: HTMLDetailsElement,
    apiSettings: ApiSettings
) {
    if (apiSettings === null || apiSettings === undefined) {
        return;
    }
    container.ontoggle = () => {
        apiSettings.toggleShow = container.open;
    };
    container.empty();
    const summary = container.createEl("summary");
    new Setting(summary).setHeading().setName("API");
    summary.createDiv("collapser").createDiv("handle");
    new Setting(container)
        .setName("Webhook URI")
        .setDesc(
            "A JSON of the current action will be sent to this URI as POST. The JSON will be in the body"
        )
        .addText((component) => {
            component.setValue(apiSettings.webhook);
            component.inputEl.addEventListener("blur", async () => {
                apiSettings.webhook = component.getValue();
                await initiativeTracker.saveSettings();
            })
        }
    );
        
}

export function createApiContainer(parent: HTMLElement, apiSettings: ApiSettings): HTMLDetailsElement {
    return parent.createEl("details", {
        cls: "initiative-tracker-additional-container",
        attr: {
            ...(apiSettings.toggleShow
                ? { open: true }
                : {})
        }
    })
}

export function isWebhookEnabled(apiSettings: ApiSettings) {
    if (apiSettings === null || apiSettings === undefined) {
        return false;
    }
    const apiWebhook: string = apiSettings.webhook;
    return apiWebhook !== null && apiWebhook !== undefined && apiWebhook !== ""
}

export function sendUpdateToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder: Creature[] = plugin.tracker.getCurrentOrder();
    const request: WebhookRequest = {
        step: step,
        order: currentOrder
    }

    requestUrl({
        url: apiSettings.webhook,
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
            'Content-Type': 'application/json',
        },
    }).catch(() => {
        // Silently ignore errors
    });
}

