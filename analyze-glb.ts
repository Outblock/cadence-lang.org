import { NodeIO } from '@gltf-transform/core';

async function main() {
    const io = new NodeIO();
    const document = await io.read('public/assets/cryptokitty.glb');
    const root = document.getRoot();

    console.log('Meshes:');
    root.listMeshes().forEach((mesh, index) => {
        console.log(`- Mesh ${index}: ${mesh.getName()}`);
    });

    console.log('\nNodes:');
    root.listNodes().forEach((node, index) => {
        console.log(`- Node ${index}: ${node.getName()} | Mesh: ${node.getMesh() ? node.getMesh().getName() : 'none'} | Scale: ${node.getScale()}`);
    });
}

main().catch(console.error);
