/**
 * Divine Smite
 * dnd5e
 * 
 * Automate rolling the Divine Smite feature damage and expending appropriate spell slots.
 */

const s_actor = canvas.tokens.controlled[0]?.actor || game.user.character;
if (s_actor?.items.find(i => i.name === "Divine Smite") === undefined){
    return ui.notifications.warn("No actor selected that can use the Divine Smite feature.");
}

const data = s_actor.getRollData();
const inputs = Object.entries(data.spells).filter(([key, values]) => {
    return values.value > 0;
}).map(([key, values]) => {
    const crd = key === "pact" ? "Pact Slot" : CONFIG.DND5E.spellLevels[key.at(-1)];
    return [key, crd, values];
});
if (!inputs.length) return ui.notifications.warn("You have no spell slots remaining.");

const options = inputs.reduce((acc, [key, crd, values]) => {
    return acc + `<option value="${key}">${crd} (${values.value}/${values.max})</option>`;
}, "");

const content = `
<form class="dnd5e">
    <div class="form-group">
        <label>Spell Slot:</label>
        <div class="form-fields">
            <select>${options}</select>
            <input type="checkbox" id="smite-extra-die">
            <label for="smite-extra-die" style="white-space: nowrap;">Extra die</label>
        </div>
    </div>
</form>`;

return new Dialog({
    title: "Divine Smite",
    content,
    buttons: {
        smite: {
            icon: "<i class='fa-solid fa-gavel'></i>",
            label: "Smite!",
            callback: rollDamage
        }
    }
}).render(true);

async function rollDamage(html) {
    const slot = html[0].querySelector("select").value;
    const extra = html[0].querySelector("#smite-extra-die").checked;
    const level = slot === "pact" ? data.spells["pact"].level : Number(slot.at(-1));
    const dice = Math.min(5, 1 + level) + (extra ? 1 : 0);
    const formula = `${dice}d8`;
    const feature = new Item.implementation({
        type: "feat", name: "Divine Smite",
        system: {
            damage: {parts: [[formula, "radiant"]]},
            actionType: "util"
        }
    }, {parent: s_actor});
    const roll = await feature.rollDamage({event});
    if (!roll) return;
    const value = data.spells[slot].value - 1;
    return s_actor.update({[`system.spells.${slot}.value`]: value});
}