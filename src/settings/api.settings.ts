import { Setting } from "obsidian";
import type InitiativeTracker from "src/main";

export interface ApiSettings {
    webhook: string;
    toggleShow: boolean;
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
            component.setValue(apiSettings.webhook).onChange(async (v) => {
                apiSettings.webhook = v
                await initiativeTracker.saveSettings();
            });
        });
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