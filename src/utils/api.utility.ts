import { requestUrl } from "obsidian";
import type InitiativeTracker from "src/main";
import type { ApiSettings } from "src/settings/api.settings";
import { Creature } from "./creature";
import type { InitiativeViewState } from "src/tracker/view.types";
import type { CreatureState } from "src/types/creatures";
import { stat } from "fs";


interface WebhookRequest {
    eventType: WebhookEvent;
    step: number;
    order: Creature[];
    encounter: EncounterState;
    changes?: CombatantChanges[];
}

let state: ApiState = {
    step: 0,
    order: [],
    encounter: {
        id: crypto.randomUUID()
    },
    settings: undefined,
    plugin: undefined
}

export function initialize(plugin: InitiativeTracker, apiSettings?: ApiSettings) {
    state.plugin = plugin;
    if (apiSettings != null) {
        state.settings = apiSettings;
    }
}

export function updateSettings(apiSettings: ApiSettings) {
    state.settings = apiSettings;
}

export interface ApiState {
    order: Creature[];
    step: number;
    encounter: EncounterState;
    settings: ApiSettings;
    plugin: InitiativeTracker
}

export interface EncounterState {
    id: string
}

enum WebhookEvent {
    NEW_ENCOUNTER = "new-encounter",
    UPDATE = "update",
    NEXT = "next",
    PRIVIOUS = "privious",
    ENCOUNTER_START = "start-encounter",
    ACTIVE_CHANGED = 'active-changed',
    HP_CHANGED = 'hp-changed',
    TEMP_HP_CHANGED = 'temp-hp-changed',
    AC_CHANGED = 'ac-changed',
    ENABLED_CHANGED = 'enabled-changed',
    HIDDEN_CHANGED = 'hidden-changed',
    MAX_HP_CHANGED = 'max-hp-changed',
    STATUS_CHANGED = 'status-changed',
    INITIATIVE_CHANGED = 'initiative-changed',
    MANUAL_ORDER_CHANGED = 'manual-order-changed',
    DISPLAY_CHANGED = 'display-changed',
    FRIENDLY_CHANGED = 'friendly-changed',
    CREATURE_ADDED = 'creature-added',
    CREATURE_REMOVED = 'creature-removed',
}

export function isWebhookEnabled() {
    const settings = _getApiSettings();
    if (settings == null) {
        return false;
    }
    const apiWebhook: string = settings.webhook;
    return apiWebhook !== null && apiWebhook !== undefined && apiWebhook !== ""
}

export function sendNewEncounterToWebhook() {
    if (!isWebhookEnabled()) {
        return;
    }
    if (state.plugin == null) {
        return;
    }
    const currentOrder = state.plugin.tracker.getCurrentOrder();
    state.step = 0;
    state.encounter.id = crypto.randomUUID();
    const newEncounterState = {
        id: state.encounter.id
    }

    const request = {
        eventType: WebhookEvent.NEW_ENCOUNTER,
        step: state.step,
        order: currentOrder,
        encounter: newEncounterState
    };
    sendToWebhook(request);
}

export function sendStartEncounterToWebhook() {
    if (!isWebhookEnabled()) {
        return;
    }
    if (state.plugin == null) {
        return;
    }
    const currentOrder = state.plugin.tracker.getCurrentOrder();
    const request = {
        eventType: WebhookEvent.ENCOUNTER_START,
        step: state.step,
        order: currentOrder,
        encounter: state.encounter,
    };
    sendToWebhook(request);
}

export function sendUpdateToWebhook() {
    if (!isWebhookEnabled()) {
        return;
    }
    if (state.plugin == null) {
        return;
    }
    const currentOrder = state.plugin.tracker.getCurrentOrder();
    const changes: CombatantChanges[] = determineChanges(currentOrder, state.order);
    const request = {
        eventType: WebhookEvent.UPDATE,
        step: state.step,
        order: currentOrder,
        encounter: state.encounter,
        changes: changes
    };
    sendToWebhook(request);
}

function getPreviousState(combatant: Creature, oldOrder: Creature[]): Creature | null {
    const found: Creature = oldOrder.find(c => c.id === combatant.id);
    return found ?? null;
}

function determineChanges(newOrder: Creature[], oldOrder: Creature[]): CombatantChanges[] {
    const changes: Map<string, CombatantChanges> = new Map();
    const processedCreatures: Set<Creature> = new Set();
    for (const newCreature of newOrder) {
        processedCreatures.add(newCreature);
        const oldCreature = getPreviousState(newCreature, oldOrder);
        if (oldCreature == null) {
            changes.set(newCreature.id, createCreatureAddedChange(newCreature));
            continue;
        }
        const combatantChanges = determineDetailedChanges(oldCreature, newCreature);
        if (combatantChanges.changes == null || combatantChanges.changes.length === 0) {
            continue;
        }
        changes.set(newCreature.id, combatantChanges);
    }
    const unprocessedCreatures: Creature[] = oldOrder.filter(creature => !processedCreatures.has(creature));
    for (const removedCreature of unprocessedCreatures) {
        changes.set(removedCreature.id, createCreatureRemovedChange(removedCreature));
    }
    return Array.from(changes.values());
}

function createCreatureAddedChange(creature: Creature): CombatantChanges {
    const change: Change = {
        property: 'creature-added',
        oldValue: null,
        newValue: creature
    };
    return { combatant: creature, changes: [change] };
}

function createCreatureRemovedChange(creature: Creature): CombatantChanges {
    const change: Change = {
        property: 'creature-removed',
        oldValue: null,
        newValue: creature
    };
    return { combatant: creature, changes: [change] };
}

export function sendNextToWebhook() {
    if (!isWebhookEnabled()) {
        return;
    }
    if (state.plugin == null) {
        return;
    }
    const currentOrder = state.plugin.tracker.getCurrentOrder();
    const request = {
        eventType: WebhookEvent.NEXT,
        step: state.step,
        order: currentOrder,
        encounter: state.encounter
    };
    sendToWebhook(request);
}

export function sendPriviousToWebhook() {
    if (!isWebhookEnabled()) {
        return;
    }
    if (state.plugin == null) {
        return;
    }
    const currentOrder = state.plugin.tracker.getCurrentOrder();
    const request: WebhookRequest = {
        eventType: WebhookEvent.PRIVIOUS,
        step: state.step,
        order: currentOrder,
        encounter: state.encounter
    };
    sendToWebhook(request);
}

function _getApiSettings(): ApiSettings | null {
    console.log("Getting API settings...");
    if (state.settings == null
        && state.plugin != null
        && state.plugin.data != null
        && state.plugin.data.api != null) {
        console.log("Loading API settings from plugin data...");
        state.settings = state.plugin.data.api;
    }
    return state.settings ?? null;
}

function sendToWebhook(request: WebhookRequest) {
    const settings = _getApiSettings();
    if (settings == null) {
        return;
    }
    state.step++;
    console.log("Sending webhook request:", request);
    requestUrl({
        url: settings.webhook,
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
            'Content-Type': 'application/json',
        },
    }).catch(() => {
        // Silently ignore errors
    });
}

function convertAppState(pluginState: InitiativeViewState): ApiState {
    const creatures = pluginState.creatures.map(creatureState => Creature.fromJSON(creatureState, state.plugin));
    let newState: ApiState = {
        ...state,
        order: creatures
    }
    return newState;
}

export function webhookNewEncounter() {
    if (!isWebhookEnabled()) {
        return;
    }
    if (state.plugin == null) {
        return;
    }
    const currentOrder = state.plugin.tracker.getCurrentOrder();
    state.step = 0;
    const request = {
        eventType: WebhookEvent.NEW_ENCOUNTER,
        step: state.step,
        order: currentOrder,
        encounter: state.encounter,
    };
    sendToWebhook(request);
}

export interface Change {
    property: string;
    oldValue: any;
    newValue: any;
}

/**
 * A detailed change object for a single creature.
 */
export interface CombatantChanges {
    combatant: Creature;
    changes: Change[];
}

/**
 * Determines the specific changes between a source and a target creature,
 * providing a detailed list of what changed.
 * @param source The original creature state.
 * @param target The new creature state.
 * @returns An array of detailed changes, including the property name, old value, and new value.
 */
function determineDetailedChanges(source: Creature, target: Creature): CombatantChanges {
    const changes: Change[] = [];

    // Properties to compare. We explicitly list them to avoid symbols.
    const stringProperties: (keyof Creature)[] = [
        'active', 'hp', 'temp', 'ac', 'current_ac', 'enabled', 'hidden',
        'max', 'current_max', 'initiative', 'manualOrder', 'display', 'friendly'
    ];

    stringProperties.forEach(prop => {
        // Skip properties that are handled separately below
        if (prop === 'ac' || prop === 'current_ac' || prop === 'max' || prop === 'current_max') {
            return;
        }
        if (source[prop] !== target[prop]) {
            changes.push({
                property: prop as string, // Cast to string to satisfy the type requirement
                oldValue: source[prop],
                newValue: target[prop],
            });
        }
    });

    // Special handling for 'ac' and 'current_ac'
    if (source.ac !== target.ac || source.current_ac !== target.current_ac) {
        changes.push({
            property: 'ac',
            oldValue: { ac: source.ac, current_ac: source.current_ac },
            newValue: { ac: target.ac, current_ac: target.current_ac },
        });
    }

    // Special handling for 'max' and 'current_max'
    if (source.max !== target.max || source.current_max !== target.current_max) {
        changes.push({
            property: 'max',
            oldValue: { max: source.max, current_max: source.current_max },
            newValue: { max: target.max, current_max: target.current_max },
        });
    }

    // Status set check
    const oldStatusIds = new Set(Array.from(source.status).map(c => c.id));
    const newStatusIds = new Set(Array.from(target.status).map(c => c.id));

    if (oldStatusIds.size !== newStatusIds.size || [...oldStatusIds].some(id => !newStatusIds.has(id)) || [...newStatusIds].some(id => !oldStatusIds.has(id))) {
        changes.push({
            property: 'status',
            oldValue: Array.from(source.status),
            newValue: Array.from(target.status),
        });
    }

    return { combatant: target, changes: changes };
}

/**
 * Compares two arrays of creatures and returns a list of detailed changes for each creature.
 * @param sourceArray The original array of creatures.
 * @param targetArray The new array of creatures.
 * @returns An array of DetailedCreatureChange objects, one for each creature that changed.
 */
export function getDetailedCreatureChanges(sourceArray: Creature[], targetArray: Creature[]): CombatantChanges[] {
    const changesList: CombatantChanges[] = [];
    const sourceMap = new Map<string, Creature>(sourceArray.map(c => [c.id, c]));
    const targetMap = new Map<string, Creature>(targetArray.map(c => [c.id, c]));

    // Find and process changes for creatures that exist in both arrays
    for (const [id, targetCreature] of targetMap.entries()) {
        const sourceCreature = sourceMap.get(id);

        if (sourceCreature) {
            const creatureChanges = determineDetailedChanges(sourceCreature, targetCreature);
            if (creatureChanges.changes.length > 0) {
                changesList.push(creatureChanges);
            }
        }
    }

    return changesList;
}