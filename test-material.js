import { NodeIO } from '@gltf-transform/core';

async function main() {
  const io = new NodeIO();
  const document = await io.read('public/assets/cryptokitty.glb');
  const materials = document.getRoot().listMaterials();
  for (const mat of materials) {
    console.log(`Material: ${mat.getName()}`);
    console.log(`- BaseColorFactor:`, mat.getBaseColorFactor());
    const tex = mat.getBaseColorTexture();
    if (tex) {
      console.log(`- BaseColorTexture: ${tex.getName()} (${tex.getMimeType()})`);
      // check if it has alpha
    }
  }
}
main();
