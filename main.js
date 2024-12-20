
import initNoirC from "@noir-lang/noirc_abi";
import initACVM from "@noir-lang/acvm_js";


const doc = document.getElementById("proof-result");

function print(text) {
  console.log(text);
  doc.innerHTML += text + "<br/>";
}

const generateProof = async () => {
  try {
    print("Initializing...");

    const { UltraHonkBackend, Barretenberg } = await import("@aztec/bb.js");
    const { Noir } = await import("@noir-lang/noir_js");
    const circuit = await import("./assets/circuit.json");

    const api = await Barretenberg.new();
    print(`Threads: ${await api.getNumThreads()}`);

    await Promise.all([
      initACVM(new URL('@noir-lang/acvm_js/web/acvm_js_bg.wasm', import.meta.url).toString()),
      initNoirC(
        new URL('@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm', import.meta.url).toString(),
      ),
    ]);

    const noir = new Noir(circuit);

    const backend = new UltraHonkBackend(circuit.bytecode);

    const startTime = performance.now();
    const { witness } = await noir.execute({ x: 3, y: 3 });
    const proof = await backend.generateProof(witness);
    const provingTime = performance.now() - startTime;
    print(`Proof generated in ${provingTime}ms`);

    const verified = await backend.verifyProof(proof);
    print(`Proof verified: ${verified}`);
  } catch (e) {
    print(e);
  }
};

document.getElementById("generate-proof").addEventListener("click", generateProof);
