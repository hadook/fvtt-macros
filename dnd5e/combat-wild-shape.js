/**
 * Combat Wild Shape
 * dnd5e
 * 
 * Automate rolling the Combat Wild Shape feature healing and expending appropriate spell slots.
 */

const a = token?.actor || game.user.character;
if (a?.items.find(i => i.name === "Combat Wild Shape") === undefined){
    return ui.notifications.warn("No actor selected that can use the Combat Wild Shape feature.");
}

const data = a.getRollData();
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
    <p>Expend one spell slot to regain 1d8 hit poits per level of the spell slot expended.</p>
    <div class="form-group">
        <label>Spell slot:</label>
        <div class="form-fields">
            <select>${options}</select>
        </div>
    </div>
</form>`;

return new Dialog({
    title: "Combat Wild Shape",
    content,
    buttons: {
        roll: {
            icon: `<i class="fa-solid fa-suitcase-medical"></i>`,
            label: "Healing",
            callback: rollHealing
        }
    }
}).render(true);

async function rollHealing(html) {
    const slot = html[0].querySelector("select").value;
    const level = data.spells[slot].level
    const formula = `${level}d8`;

    const feature = new Item.implementation({
        type: "feat",
        name: "Combat Wild Shape",
        system: {
            damage: {parts: [[formula, "healing"]]},
            actionType: "heal"
        }
    }, {parent: a});

    const roll = await feature.rollDamage({event});
    if (!roll) return;
    const value = data.spells[slot].value - 1;
    return a.update({[`system.spells.${slot}.value`]: value});
}