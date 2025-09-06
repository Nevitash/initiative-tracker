import { requestUrl } from "obsidian";
import type InitiativeTracker from "src/main";
import type { ApiSettings } from "src/settings/api.settings";
import type { Creature } from "./creature";


interface WebhookRequest {
    eventType: WebhookEvent;
    step: number;
    state: ApiState;
}

let state: ApiState = {
    step: 0,
    order: [],
    encounter: {
        id: crypto.randomUUID()
    }
}

export interface ApiState {
    order: Creature[];
    step: number;
    encounter: EncounterState;
}

export interface EncounterState{
    id: string
}

enum WebhookEvent {
    NEW_ENCOUNTER = "new-encounter",
    UPDATE = "update",
    NEXT = "next",
    PRIVIOUS = "privious",
    ENCOUNTER_START = "start-encounter",
}

export function isWebhookEnabled(apiSettings: ApiSettings) {
    if (apiSettings === null || apiSettings === undefined) {
        return false;
    }
    const apiWebhook: string = apiSettings.webhook;
    return apiWebhook !== null && apiWebhook !== undefined && apiWebhook !== ""
}

export function sendNewEncounterToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    state.step = 0;
    state.encounter.id = crypto.randomUUID();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.NEW_ENCOUNTER,
        step: state.step,
        state: newState,
    };
    sendToWebhook(apiSettings, request);
}

export function sendStartEncounterToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.ENCOUNTER_START,
        step: state.step,
        state: newState
    };
    sendToWebhook(apiSettings, request);
}

export function sendUpdateToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.UPDATE,
        step: state.step,
        state: newState
    };
    sendToWebhook(apiSettings, request);
}

export function sendNextToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.NEXT,
        step: state.step,
        state: newState
    };
    sendToWebhook(apiSettings, request);
}

export function sendPriviousToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.PRIVIOUS,
        step: state.step,
        state: newState
    };
    sendToWebhook(apiSettings, request);
}

function sendToWebhook(apiSettings: ApiSettings, request: WebhookRequest) {
    state.step++;
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

export function webhookNewEncounter(apiSettings: ApiSettings, plugin: InitiativeTracker) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    state.step = 0;
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.NEW_ENCOUNTER,
        step: state.step,
        state: newState,
    };
    sendToWebhook(apiSettings, request);
}