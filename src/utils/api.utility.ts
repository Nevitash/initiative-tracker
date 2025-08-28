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
    order: []
}

export interface ApiState {
    order: Creature[];
    step: number;
}

enum WebhookEvent {
    NEW_ENCOUNTER = "new-encounter",
    UPDATE = "update",
    NEXT = "next",
    PRIVIOUS = "privious",
    ADDED_COMBATANT = "add-combatant",
    REMOVED_COMBATANT = "remove-combatant",
    ADDED_CONDITIONS = "add-conditions",
    REMOVED_CONDITIONS = "remove-conditions",
    STATS_UPDATE = "update-stats",
}

export function isWebhookEnabled(apiSettings: ApiSettings) {
    if (apiSettings === null || apiSettings === undefined) {
        return false;
    }
    const apiWebhook: string = apiSettings.webhook;
    return apiWebhook !== null && apiWebhook !== undefined && apiWebhook !== ""
}

export function sendNewEncounterToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step?: number) {
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

export function sendUpdateToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step?: number) {
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

export function sendNextToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step: number) {
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

export function sendPriviousToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step: number) {
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

export function sendAddedCombatantToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step?: number) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.ADDED_COMBATANT,
        step: state.step,
        state: newState
    };
    sendToWebhook(apiSettings, request);
}

export function sendRemovedCombatantToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step?: number) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.REMOVED_COMBATANT,
        step: state.step,
        state: newState
    };
    sendToWebhook(apiSettings, request);
}

export function sendAddedConditionsToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step?: number) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.ADDED_CONDITIONS,
        step: state.step,
        state: newState
    };
    sendToWebhook(apiSettings, request);
}

export function sendRemovedConditionsToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step?: number) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.REMOVED_CONDITIONS,
        step: state.step,
        state: newState
    };
    sendToWebhook(apiSettings, request);
}

export function sendStatsUpdateToWebhook(apiSettings: ApiSettings, plugin: InitiativeTracker, step?: number) {
    if (!isWebhookEnabled(apiSettings)) {
        return;
    }
    const currentOrder = plugin.tracker.getCurrentOrder();
    let newState: ApiState = {
        ...state,
        order: currentOrder
    }
    const request = {
        eventType: WebhookEvent.STATS_UPDATE,
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