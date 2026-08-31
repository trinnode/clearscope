import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  holderJurisdiction(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  witnessCheckExclusion(context: __compactRuntime.WitnessContext<Ledger, PS>,
                        jurisdiction_0: Uint8Array,
                        excluded_0: string): [PS, boolean];
}

export type ImpureCircuits<PS> = {
  evaluateJurisdictionExclusion(context: __compactRuntime.CircuitContext<PS>,
                                excludedJurisdictions_0: string): Promise<__compactRuntime.CircuitResults<PS, number>>;
}

export type ProvableCircuits<PS> = {
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  evaluateJurisdictionExclusion(context: __compactRuntime.CircuitContext<PS>,
                                excludedJurisdictions_0: string): Promise<__compactRuntime.CircuitResults<PS, number>>;
}

export type Ledger = {
  readonly policyId: Uint8Array;
  readonly policyVersion: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
