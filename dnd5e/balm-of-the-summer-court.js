/**
 * Balm of the Summer Court
 * dnd5e
 * 
 * Automate rolling the 'Balm of the Summer Court' feature healing and expending appropriate item uses.
 */

const a = token?.actor || game.user.character;
const f = a?.items.find(i => i.name === "Balm of the Summer Court");
if (f === undefined){
    return ui.notifications.warn("No actor selected that can use the Balm of the Summer Court feature.");
}

const max_uses = Math.min(Math.floor(a.getRollData().classes.druid.levels / 2), f.system.uses.value);
const inputs = Array.from({length: max_uses}, (_, i) => {
    const number = i + 1;
    return [number, `${number}d6`];
});
if (!inputs.length) return ui.notifications.warn("You have no more healing dice available!");
const options = inputs.reduce((acc, [key, value]) => {
    return acc + `<option value="${key}">${value}</option>`;
}, "");

const content = `
<form class="dnd5e">
    <p>Select the number of dice to roll from your pool of fey energy.</p>
    <div class="form-group">
        <label>Spend dice:</label>
        <div class="form-fields">
            <select>${options}</select>
        </div>
    </div>
</form>`;

return new Dialog({
    title: "Balm of the Summer Court",
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
    const dice = html[0].querySelector("select").value;
    const hp_heal = `${dice}d6`;
    const hp_tmp = `${dice}`;
    const feature = new Item.implementation({
        type: "feat",
        name: "Balm of the Summer Court",
        system: {
            damage: {parts: [
                [hp_heal, "healing"],
                [hp_tmp, "temphp"]
            ]},
            actionType: "heal"
        }
    }, {parent: a});

    const roll = await feature.rollDamage({event});
    if (!roll) return;

    const uses = f.system.uses.value - 1;
    return await f.update({"system.uses.value": uses});
}