import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policyId_0: Uint8Array,
                policyVersion_0: Uint8Array,
                paramsHash_0: Uint8Array,
                requester_0: Uint8Array,
                expiry_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  respondToRequest(context: __compactRuntime.CircuitContext<PS>,
                   requestId_0: Uint8Array,
                   result_0: number): Promise<__compactRuntime.CircuitResults<PS, number>>;
  getRequest(context: __compactRuntime.CircuitContext<PS>,
             requestId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, { requestId: Uint8Array,
                                                                                     policyId: Uint8Array,
                                                                                     policyVersion: Uint8Array,
                                                                                     paramsHash: Uint8Array,
                                                                                     requester: Uint8Array,
                                                                                     expiry: bigint,
                                                                                     status: number
                                                                                   }>>;
  isExpired(context: __compactRuntime.CircuitContext<PS>,
            requestId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type ProvableCircuits<PS> = {
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policyId_0: Uint8Array,
                policyVersion_0: Uint8Array,
                paramsHash_0: Uint8Array,
                requester_0: Uint8Array,
                expiry_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  respondToRequest(context: __compactRuntime.CircuitContext<PS>,
                   requestId_0: Uint8Array,
                   result_0: number): Promise<__compactRuntime.CircuitResults<PS, number>>;
  getRequest(context: __compactRuntime.CircuitContext<PS>,
             requestId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, { requestId: Uint8Array,
                                                                                     policyId: Uint8Array,
                                                                                     policyVersion: Uint8Array,
                                                                                     paramsHash: Uint8Array,
                                                                                     requester: Uint8Array,
                                                                                     expiry: bigint,
                                                                                     status: number
                                                                                   }>>;
  isExpired(context: __compactRuntime.CircuitContext<PS>,
            requestId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  createRequest(context: __compactRuntime.CircuitContext<PS>,
                requestId_0: Uint8Array,
                policyId_0: Uint8Array,
                policyVersion_0: Uint8Array,
                paramsHash_0: Uint8Array,
                requester_0: Uint8Array,
                expiry_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  respondToRequest(context: __compactRuntime.CircuitContext<PS>,
                   requestId_0: Uint8Array,
                   result_0: number): Promise<__compactRuntime.CircuitResults<PS, number>>;
  getRequest(context: __compactRuntime.CircuitContext<PS>,
             requestId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, { requestId: Uint8Array,
                                                                                     policyId: Uint8Array,
                                                                                     policyVersion: Uint8Array,
                                                                                     paramsHash: Uint8Array,
                                                                                     requester: Uint8Array,
                                                                                     expiry: bigint,
                                                                                     status: number
                                                                                   }>>;
  isExpired(context: __compactRuntime.CircuitContext<PS>,
            requestId_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type Ledger = {
  requests: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { requestId: Uint8Array,
                                 policyId: Uint8Array,
                                 policyVersion: Uint8Array,
                                 paramsHash: Uint8Array,
                                 requester: Uint8Array,
                                 expiry: bigint,
                                 status: number
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { requestId: Uint8Array,
  policyId: Uint8Array,
  policyVersion: Uint8Array,
  paramsHash: Uint8Array,
  requester: Uint8Array,
  expiry: bigint,
  status: number
}]>
  };
  readonly requestCount: bigint;
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
