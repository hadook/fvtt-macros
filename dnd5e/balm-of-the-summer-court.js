/**
 * Balm of the Summer Court
 * dnd5e
 * 
 * Automate rolling the 'Balm of the Summer Court' feature healing and expending appropriate item uses.
 */

const a = token?.actor || game.user.character;
if (a?.items.find(i => i.name === "Balm of the Summer Court") === undefined){
    return ui.notifications.warn("No actor selected that can use the Balm of the Summer Court feature.");
}

