import { AccountId, AccountId20 } from "@polkadot/types/interfaces";
import { blake2AsU8a } from "@polkadot/util-crypto";
import { TypeRegistry } from "@polkadot/types";

export function relayAccountFromMultisigId(
  paraId: number,
  id: number
): AccountId {
  const registry = new TypeRegistry();

  const bodyId = registry.createType("BodyId", { Index: id }).toU8a();
  const bodyPart = registry.createType("BodyPart", { Voice: {} }).toU8a();

  let toHash = new Uint8Array([
    ...new TextEncoder().encode("ChildChain"),
    ...registry.createType("Compact<u32>", paraId).toU8a(),
    ...registry
      .createType("Compact<u32>", 4 + bodyId.length + bodyPart.length)
      .toU8a(),
    ...new TextEncoder().encode("Body"),
    ...bodyId,
    ...bodyPart,
  ]);

  const address = blake2AsU8a(toHash).slice(0, 32) as AccountId;

  return address;
}

export function evmAccountFromMultisigId(
  paraId: number,
  id: number
): AccountId20 {
  const registry = new TypeRegistry();

  const bodyId = registry.createType("BodyId", { Index: id }).toU8a();
  const bodyPart = registry.createType("BodyPart", { Voice: {} }).toU8a();

  let toHash = new Uint8Array([
    ...new TextEncoder().encode("ChildChain"),
    ...registry.createType("Compact<u32>", paraId).toU8a(),
    ...registry
      .createType("Compact<u32>", 4 + bodyId.length + bodyPart.length)
      .toU8a(),
    ...new TextEncoder().encode("Body"),
    ...bodyId,
    ...bodyPart,
  ]);

  const address = blake2AsU8a(toHash).slice(0, 20) as AccountId20;

  return address;
}
