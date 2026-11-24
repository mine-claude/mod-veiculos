// @ts-check
import { MobType, MobModel } from '../mineclaude-sdk.js';

const LIFT = 3, SINK = 0.8, CRUISE = 5, CEILING = 120; // blocks/s; the burner gives up near the sky

// The burner flame flickers, the envelope sways a little.
export class BalaoModel extends MobModel {
  static geometry = 'models/balao.geo.json';
  static texture = 'textures/mob/balao.png';

  animate({ time }) {
    this.part('chama').rotation.y = time * 9;
    this.part('chama').rotation.x = Math.sin(time * 23) * 0.15;
    this.part('envelope').rotation.z = Math.sin(time * 0.9) * 0.04;
  }
}

// A hot-air balloon: no gravity of its own; space fires the burner, without it the balloon sinks slowly,
// W/S/A/D drift it toward where the pilot looks. Empty, it sinks to the ground and waits.
export default class Balao extends MobType {
  name = 'Balão';
  halfW = 0.8;
  height = 2.9;
  hp = 20;
  speed = 1;
  behavior = 'passive';
  gravity = 0;
  mount = { seat: 0.2, speed: 4, free: true };
  drops = [['veiculos:chave_balao', 1, 1]];
  model = BalaoModel;
  #piloted = new Map(); // mob id -> last time someone steered it (ms)

  travel(e) { // nobody aboard: settle down gently
    if (Date.now() - (this.#piloted.get(e.mob.id) ?? 0) < 300) return; // a pilot is aboard: control() decides
    if (!e.onGround) e.velocity.y = -SINK;
  }

  control(e) {
    if (this.#piloted.size > 256) this.#piloted.clear();
    this.#piloted.set(e.mob.id, Date.now());
    const { forward, strafe, jump, yaw } = e.input, k = Math.min(1, 1.5 * e.dt);
    const up = jump && e.mob.pos.y < CEILING ? LIFT : -SINK;
    e.velocity.y += (up - e.velocity.y) * k;
    const wx = -Math.sin(yaw) * forward + Math.cos(yaw) * strafe, wz = -Math.cos(yaw) * forward - Math.sin(yaw) * strafe;
    e.velocity.x += (wx * CRUISE - e.velocity.x) * k * 0.6; // a balloon is slow to answer
    e.velocity.z += (wz * CRUISE - e.velocity.z) * k * 0.6;
    if (wx || wz) e.yaw = Math.atan2(-wx, -wz);
  }
}
