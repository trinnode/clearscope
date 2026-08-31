import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  witnessCaller(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  registerPolicy(context: __compactRuntime.CircuitContext<PS>,
                 policyId_0: Uint8Array,
                 name_0: Uint8Array,
                 version_0: Uint8Array,
                 logicHash_0: Uint8Array,
                 compactSource_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  getPolicy(context: __compactRuntime.CircuitContext<PS>, policyId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, { policyId: Uint8Array,
                                                                                                                                 name: Uint8Array,
                                                                                                                                 version: Uint8Array,
                                                                                                                                 logicHash: Uint8Array,
                                                                                                                                 compactSource: Uint8Array
                                                                                                                               }>>;
  isRegistered(context: __compactRuntime.CircuitContext<PS>,
               policyId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type ProvableCircuits<PS> = {
  registerPolicy(context: __compactRuntime.CircuitContext<PS>,
                 policyId_0: Uint8Array,
                 name_0: Uint8Array,
                 version_0: Uint8Array,
                 logicHash_0: Uint8Array,
                 compactSource_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  getPolicy(context: __compactRuntime.CircuitContext<PS>, policyId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, { policyId: Uint8Array,
                                                                                                                                 name: Uint8Array,
                                                                                                                                 version: Uint8Array,
                                                                                                                                 logicHash: Uint8Array,
                                                                                                                                 compactSource: Uint8Array
                                                                                                                               }>>;
  isRegistered(context: __compactRuntime.CircuitContext<PS>,
               policyId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  registerPolicy(context: __compactRuntime.CircuitContext<PS>,
                 policyId_0: Uint8Array,
                 name_0: Uint8Array,
                 version_0: Uint8Array,
                 logicHash_0: Uint8Array,
                 compactSource_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  getPolicy(context: __compactRuntime.CircuitContext<PS>, policyId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, { policyId: Uint8Array,
                                                                                                                                 name: Uint8Array,
                                                                                                                                 version: Uint8Array,
                                                                                                                                 logicHash: Uint8Array,
                                                                                                                                 compactSource: Uint8Array
                                                                                                                               }>>;
  isRegistered(context: __compactRuntime.CircuitContext<PS>,
               policyId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type Ledger = {
  registeredPolicies: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { policyId: Uint8Array,
                                 name: Uint8Array,
                                 version: Uint8Array,
                                 logicHash: Uint8Array,
                                 compactSource: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { policyId: Uint8Array,
  name: Uint8Array,
  version: Uint8Array,
  logicHash: Uint8Array,
  compactSource: Uint8Array
}]>
  };
  readonly policyCount: bigint;
  readonly registryAuthority: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               authority_0: Uint8Array): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
