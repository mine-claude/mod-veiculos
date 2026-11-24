// @ts-check
import { ModInitializer } from './mineclaude-sdk.js';
import Carro from './mobs/carro.ts';
import Balao from './mobs/balao.ts';
import Chave from './items/chave.ts';

// Vehicles made only of SDK classes: a mob with `mount.free` + `control(e)`, and an item that spawns it.
export default class Veiculos extends ModInitializer {
  onInitialize(ctx) {
    ctx.mobs.register('carro', new Carro());
    ctx.mobs.register('balao', new Balao());
    ctx.items.register('chave_carro', new Chave('Chave do carro', 'veiculos:carro'));
    ctx.items.register('chave_balao', new Chave('Chave do balão', 'veiculos:balao'));
    ctx.recipes.add({ out: 'veiculos:chave_carro', n: 1, in: [['mineclaude:iron_ingot', 5], ['mineclaude:coal', 2]], station: 'crafting_table' });
    ctx.recipes.add({ out: 'veiculos:chave_balao', n: 1, in: [['mineclaude:wool', 6], ['mineclaude:coal', 2]], station: 'crafting_table' });
  }
}
