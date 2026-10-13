// The demo world, built through the data model (the same code runs in the browser and on the Node server).
import { createInstance, Vector3, Color3 } from './datamodel.js';
// Classic BrickColor palette (name -> sRGB hex)
export const BC = { 'Bright red': 0xc4281c, 'Bright yellow': 0xf5cd30, 'Bright blue': 0x0d69ac, 'Dark green': 0x287f47, 'Bright green': 0x4b974b,
  'Earth green': 0x27462d, 'Medium stone grey': 0xa3a2a5, 'Dark stone grey': 0x635f62, 'Institutional white': 0xf2f3f3, 'Black': 0x1b2a35,
  'Brick yellow': 0xd7c59a, 'Cool yellow': 0xfdea8d, 'Reddish brown': 0x694028 };
export function buildDemoWorld(game) {
  const ws = game.Workspace, V = (x, y, z) => new Vector3(x, y, z);
  const part = (shape, pos, size, color, o = {}) => {
    const p = createInstance('Part'); p.Shape = shape; p.Position = V(...pos); p.Size = V(...size); p.Color = Color3.fromHex(BC[color]); p.Anchored = o.anchored ?? true;
    if (o.name) p.Name = o.name; if (o.studs) p.Studs = true; if (o.rough !== undefined) p.Roughness = o.rough; if (o.metal !== undefined) p.Metalness = o.metal; if (o.yaw) p.Orientation = V(0, o.yaw, 0);
    p.Parent = o.parent ?? ws; return p;
  };
  const house = createInstance('Model', ws); house.Name = 'House';
  part('Block', [0, -1, 0], [2048, 2, 2048], 'Bright green', { studs: true, rough: 0.8, name: 'Baseplate' });
  part('Block', [0, 0.2, 0], [24, 0.4, 20], 'Dark green', { studs: true, rough: 0.8, parent: house, name: 'Lawn' });
  part('Block', [0, 4.4, 0], [18, 8, 14], 'Brick yellow', { rough: 0.7, parent: house, name: 'Walls' });
  part('Wedge', [0, 10.4, -4], [20, 4, 8], 'Bright red', { rough: 0.55, parent: house, name: 'RoofBack' });
  part('Wedge', [0, 10.4, 4], [20, 4, 8], 'Bright red', { rough: 0.55, yaw: 180, parent: house, name: 'RoofFront' });
  part('Block', [-4, 11.4, -2], [2, 6, 2], 'Cool yellow', { rough: 0.7, parent: house, name: 'Chimney' });
  part('Block', [0, 2.4, 7.25], [4, 4, 0.5], 'Black', { parent: house, name: 'Door' }); part('Ball', [0, 4.4, 7.25], [4, 4, 0.5], 'Black', { parent: house, name: 'DoorArch' });
  for (const x of [-6, 6]) { part('Block', [x, 5, 7.25], [2, 3, 0.5], 'Reddish brown', { parent: house, name: 'Window' }); part('Ball', [x, 6.5, 7.25], [2, 2, 0.5], 'Reddish brown', { parent: house, name: 'WindowArch' }); }
  part('Block', [0, 0.2, 22], [4, 0.4, 24], 'Medium stone grey', { studs: true, name: 'Path' }); part('Block', [22, 0.2, 32], [48, 0.4, 4], 'Medium stone grey', { studs: true, name: 'Path' });
  part('Block', [44, 0.2, 7], [4, 0.4, 50], 'Medium stone grey', { studs: true, name: 'Path' });
  for (const [x, z] of [[24, -8], [31, -14], [19, -18]]) { part('Cylinder', [x, 2, z], [1, 4, 1], 'Reddish brown', { rough: 0.8, name: 'Trunk' }); part('Cone', [x, 7, z], [6, 8, 6], 'Earth green', { rough: 0.8, name: 'Leaves' }); }
  for (const [x, n] of [[50, 'Bright red'], [56, 'Bright yellow'], [62, 'Institutional white'], [68, 'Black']]) part('Block', [x, 1, -24], [4, 2, 2], n, { studs: true, name: 'Brick' });
  part('Block', [36, 3, -18], [6, 6, 6], 'Bright yellow', { studs: true }); part('Block', [36, 6.5, -18], [6, 1, 6], 'Dark stone grey', { studs: true, metal: 0.8, rough: 0.35 });
  part('Block', [-30, 2, -6], [6, 4, 6], 'Bright blue', { studs: true });
  part('Cylinder', [41, 3, 6], [1, 6, 1], 'Institutional white'); part('Cylinder', [47, 3, 6], [1, 6, 1], 'Institutional white'); part('Block', [44, 6.5, 6], [8, 1, 1], 'Bright red');
  part('Ball', [-16, 2, 20], [4, 4, 4], 'Bright red', { rough: 0.3 }); part('Ball', [16, 2, 20], [4, 4, 4], 'Bright blue', { rough: 0.3 });
  part('Ball', [-8, 2, 28], [4, 4, 4], 'Bright yellow', { metal: 1, rough: 0.25 }); part('Ball', [8, 2, 28], [4, 4, 4], 'Institutional white', { rough: 0.3 });
  for (const x of [-12, -4, 4, 12]) part('Cylinder', [x, 8, -26], [4, 16, 4], 'Medium stone grey', { rough: 0.8, name: 'Pillar' });
  // Physics playground: unanchored crates and a welded pair
  const crates = createInstance('Folder', ws); crates.Name = 'Crates';
  for (let i = 0; i < 6; i++) part('Block', [-4 + (i % 3) * 4.2, 1 + Math.floor(i / 3) * 2.1, 40], [4, 2, 4], ['Bright yellow', 'Bright red', 'Bright blue'][i % 3], { anchored: false, studs: true, parent: crates, name: 'Crate' });
  const lighting = game.Lighting; lighting.SunDirection = V(0.45, 0.77, 0.45);
  return { house, crates };
}
