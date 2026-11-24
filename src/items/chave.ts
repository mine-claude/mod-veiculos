// @ts-check
import { ItemType } from '../mineclaude-sdk.js';

// A key that puts its vehicle in the world where you click (world.spawnMob) and is used up;
// breaking the vehicle gives the key back (the mob's drops).
export default class Chave extends ItemType {
  stack = 1;
  icon = 'gem';
  #vehicle;

  constructor(name, vehicle) {
    super();
    this.name = name;
    this.#vehicle = vehicle;
  }

  onUse(e) {
    if (!e.pos) return 'pass';
    const at = { x: e.pos.x + 0.5, y: e.pos.y + 1, z: e.pos.z + 0.5 };
    if (!e.world.spawnMob(at, this.#vehicle)) { e.player.message('Não deu para colocar o veículo aqui.'); return 'fail'; }
    e.player.take(e.item, 1);
    return 'success';
  }
}
