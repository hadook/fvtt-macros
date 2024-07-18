/**
 * Faerie Fire
 * dnd5e
 * 
 * Toggle the Faerie Fire light effect on the selected tokens on/off.
 */

if (!token) {
    ui.notifications.warn("You need to select a token to use this macro.");
    return null;
}

const configs = {
    off:    {bright: 0, dim: 0},
    on:     {bright: 0, dim: 10, "angle": 360, "color": "#8135c0", "alpha": 0.3, "luminosity": 0.5,
                animation: {type: "fairy", speed: 3, "intensity": 5, "reverse": false }}
};

const states = new Set(Object.keys(configs));
states.delete("off");

let state = token.document.flags.world?.light ?? null;
for (let current_token of canvas.tokens.controlled) {
    if (states.has(state)) {
        current_token.document.update({light: configs.off, "flags.world.light": null});
    } else {
        current_token.document.update({light: configs.on, "flags.world.light": "on"});
    }
}
return null;