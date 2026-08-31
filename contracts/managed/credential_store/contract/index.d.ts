import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getCredentialAttribute(context: __compactRuntime.WitnessContext<Ledger, PS>,
                         credentialId_0: Uint8Array,
                         attributeKey_0: Uint8Array): [PS, { credentialId: Uint8Array,
                                                             issuer: Uint8Array,
                                                             credentialType: Uint8Array,
                                                             issuedDate: Uint8Array,
                                                             attributeKey: Uint8Array,
                                                             attributeValue: Uint8Array
                                                           }];
  witnessParseThreshold(context: __compactRuntime.WitnessContext<Ledger, PS>,
                        params_0: Uint8Array): [PS, bigint];
  witnessParseTier(context: __compactRuntime.WitnessContext<Ledger, PS>,
                   params_0: Uint8Array): [PS, bigint];
  witnessComputeAge(context: __compactRuntime.WitnessContext<Ledger, PS>,
                    dob_0: Uint8Array): [PS, bigint];
  witnessCheckExclusion(context: __compactRuntime.WitnessContext<Ledger, PS>,
                        jurisdiction_0: Uint8Array,
                        excluded_0: Uint8Array): [PS, boolean];
}

export type ImpureCircuits<PS> = {
  evaluatePolicyBoundary(context: __compactRuntime.CircuitContext<PS>,
                         credentialId_0: Uint8Array,
                         attributeKey_0: Uint8Array,
                         policyType_0: Uint8Array,
                         policyParams_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, number>>;
}

export type ProvableCircuits<PS> = {
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  evaluatePolicyBoundary(context: __compactRuntime.CircuitContext<PS>,
                         credentialId_0: Uint8Array,
                         attributeKey_0: Uint8Array,
                         policyType_0: Uint8Array,
                         policyParams_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, number>>;
}

export type Ledger = {
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
