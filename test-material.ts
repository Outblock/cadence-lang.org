import { NodeIO } from '@gltf-transform/core';

async function main() {
    const io = new NodeIO();
    const document = await io.read('public/assets/cryptokitty.glb');
    const meshes = document.getRoot().listMeshes();
    meshes.forEach(m => {
        m.listPrimitives().forEach(p => {
            const attrs = p.listAttributes();
            console.log('Attributes:', attrs.map(a => a.getName()));
        });
    });
}
main().catch(e => console.error(e));
