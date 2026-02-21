import { NodeIO } from '@gltf-transform/core';

async function main() {
  const io = new NodeIO();
  const document = await io.read('public/assets/cryptokitty.glb');
  const prim = document.getRoot().listMeshes()[0].listPrimitives()[0];
  const pos = prim.getAttribute('POSITION');
  
  let flatZCounts: Record<string, number> = {};
  for (let i = 0; i < pos.getCount(); i++) {
        const v = pos.getElement(i, []);
        const zs = v[2].toFixed(3);
        flatZCounts[zs] = (flatZCounts[zs] || 0) + 1;
  }
  const sorted = Object.entries(flatZCounts).sort((a, b) => b[1] - a[1]);
  console.log("Top Z values by count:", sorted.slice(0, 10));
}
main();
