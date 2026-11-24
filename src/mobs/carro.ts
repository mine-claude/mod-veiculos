// @ts-check
import { MobType, MobModel } from '../mineclaude-sdk.js';

const MAX_SPEED = 16, REVERSE = 5, ACCEL = 9, BRAKE = 22, DRAG = 3, TURN = 2.2; // blocks/s, blocks/s², rad/s

// The car's look: the wheels turn with the speed and the front ones steer.
export class CarroModel extends MobModel {
  static geometry = 'models/carro.geo.json';
  static texture = 'textures/mob/carro.png';
  #roll = 0;

  animate({ speed, dt }) {
    this.#roll += speed * dt * 4;
    for (const w of ['roda_fe', 'roda_fd', 'roda_te', 'roda_td']) this.part(w).rotation.x = -this.#roll;
  }
}

// A car, all from the public SDK: `mount.free` makes anyone get in, `control` turns the rider's keys into driving.
// W accelerates, S brakes and then reverses, A/D steer (only while moving), and with nobody inside it stays put.
export default class Carro extends MobType {
  name = 'Carro';
  halfW = 1;
  height = 1.2;
  hp = 40;
  speed = 1;
  behavior = 'passive';
  mount = { seat: 0.55, speed: 8, free: true };
  drops = [['veiculos:chave_carro', 1, 1]];
  model = CarroModel;
  #speed = new Map(); // mob id -> signed speed along its nose (blocks/s)

  control(e) {
    const { forward, strafe } = e.input, dt = e.dt;
    let v = this.#speed.get(e.mob.id) ?? 0;
    if (forward > 0) v = Math.min(MAX_SPEED, v + ACCEL * forward * dt);
    else if (forward < 0) v = v > 0.2 ? Math.max(0, v - BRAKE * dt) : Math.max(-REVERSE, v - ACCEL * 0.6 * dt);
    else v -= Math.sign(v) * Math.min(Math.abs(v), DRAG * dt);
    // steer harder at low speed, never in place; backing up turns the other way, like a real car
    const grip = Math.min(1, Math.abs(v) / 4) * (1 - Math.min(0.5, Math.abs(v) / MAX_SPEED * 0.5));
    e.yaw -= strafe * TURN * grip * Math.sign(v) * dt;
    e.velocity.x = -Math.sin(e.yaw) * v;
    e.velocity.z = -Math.cos(e.yaw) * v;
    if (Math.abs(v) > 1 && Math.hypot(e.velocity.x, e.velocity.z) < 0.01) v = 0; // hit a wall
    if (this.#speed.size > 512) this.#speed.clear();
    this.#speed.set(e.mob.id, v);
  }
}
