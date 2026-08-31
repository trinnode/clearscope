import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.18.0-rc.1');

const _descriptor_0 = __compactRuntime.CompactTypeBoolean;

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_3 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_4 = new __compactRuntime.CompactTypeBytes(64);

const _descriptor_5 = new __compactRuntime.CompactTypeBytes(256);

class _CredentialAttribute_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_4.alignment().concat(_descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_5.alignment())))));
  }
  fromValue(value_0) {
    return {
      credentialId: _descriptor_3.fromValue(value_0),
      issuer: _descriptor_4.fromValue(value_0),
      credentialType: _descriptor_4.fromValue(value_0),
      issuedDate: _descriptor_3.fromValue(value_0),
      attributeKey: _descriptor_4.fromValue(value_0),
      attributeValue: _descriptor_5.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.credentialId).concat(_descriptor_4.toValue(value_0.issuer).concat(_descriptor_4.toValue(value_0.credentialType).concat(_descriptor_3.toValue(value_0.issuedDate).concat(_descriptor_4.toValue(value_0.attributeKey).concat(_descriptor_5.toValue(value_0.attributeValue))))));
  }
}

const _descriptor_6 = new _CredentialAttribute_0();

const _descriptor_7 = new __compactRuntime.CompactTypeEnum(2, 1);

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _Either_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_0.fromValue(value_0),
      left: _descriptor_3.fromValue(value_0),
      right: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.is_left).concat(_descriptor_3.toValue(value_0.left).concat(_descriptor_3.toValue(value_0.right)));
  }
}

const _descriptor_9 = new _Either_0();

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_3.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.bytes);
  }
}

const _descriptor_11 = new _ContractAddress_0();

const _descriptor_12 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.getCredentialAttribute) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getCredentialAttribute');
    }
    if (typeof(witnesses_0.witnessParseThreshold) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named witnessParseThreshold');
    }
    if (typeof(witnesses_0.witnessParseTier) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named witnessParseTier');
    }
    if (typeof(witnesses_0.witnessComputeAge) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named witnessComputeAge');
    }
    if (typeof(witnesses_0.witnessCheckExclusion) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named witnessCheckExclusion');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      evaluatePolicyBoundary: async (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`evaluatePolicyBoundary: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const credentialId_0 = args_1[1];
        const attributeKey_0 = args_1[2];
        const policyType_0 = args_1[3];
        const policyParams_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('evaluatePolicyBoundary',
                                     'argument 1 (as invoked from Typescript)',
                                     'credential_store.compact line 37 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(credentialId_0.buffer instanceof ArrayBuffer && credentialId_0.BYTES_PER_ELEMENT === 1 && credentialId_0.length === 32)) {
          __compactRuntime.typeError('evaluatePolicyBoundary',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'credential_store.compact line 37 char 1',
                                     'Bytes<32>',
                                     credentialId_0)
        }
        if (!(attributeKey_0.buffer instanceof ArrayBuffer && attributeKey_0.BYTES_PER_ELEMENT === 1 && attributeKey_0.length === 64)) {
          __compactRuntime.typeError('evaluatePolicyBoundary',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'credential_store.compact line 37 char 1',
                                     'Bytes<64>',
                                     attributeKey_0)
        }
        if (!(policyType_0.buffer instanceof ArrayBuffer && policyType_0.BYTES_PER_ELEMENT === 1 && policyType_0.length === 32)) {
          __compactRuntime.typeError('evaluatePolicyBoundary',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'credential_store.compact line 37 char 1',
                                     'Bytes<32>',
                                     policyType_0)
        }
        if (!(policyParams_0.buffer instanceof ArrayBuffer && policyParams_0.BYTES_PER_ELEMENT === 1 && policyParams_0.length === 256)) {
          __compactRuntime.typeError('evaluatePolicyBoundary',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'credential_store.compact line 37 char 1',
                                     'Bytes<256>',
                                     policyParams_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_3.toValue(credentialId_0).concat(_descriptor_4.toValue(attributeKey_0).concat(_descriptor_3.toValue(policyType_0).concat(_descriptor_5.toValue(policyParams_0)))),
            alignment: _descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_3.alignment().concat(_descriptor_5.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._evaluatePolicyBoundary_0(context,
                                                              partialProofData,
                                                              credentialId_0,
                                                              attributeKey_0,
                                                              policyType_0,
                                                              policyParams_0);
        partialProofData.output = { value: _descriptor_7.toValue(result_0), alignment: _descriptor_7.alignment() };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      }
    };
    this.impureCircuits = {
      evaluatePolicyBoundary: this.circuits.evaluatePolicyBoundary
    };
    this.provableCircuits = {};
  }
  async initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    const context = __compactRuntime.createCircuitContext('constructor', __compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    state_0.data = new __compactRuntime.ChargedState(context.callContext.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.callContext.currentPrivateState,
      currentZswapLocalState: context.callContext.currentZswapLocalState
    }
  }
  _getCredentialAttribute_0(context,
                            partialProofData,
                            credentialId_0,
                            attributeKey_0)
  {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getCredentialAttribute(witnessContext_0,
                                                                                 credentialId_0,
                                                                                 attributeKey_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.credentialId.buffer instanceof ArrayBuffer && result_0.credentialId.BYTES_PER_ELEMENT === 1 && result_0.credentialId.length === 32 && result_0.issuer.buffer instanceof ArrayBuffer && result_0.issuer.BYTES_PER_ELEMENT === 1 && result_0.issuer.length === 64 && result_0.credentialType.buffer instanceof ArrayBuffer && result_0.credentialType.BYTES_PER_ELEMENT === 1 && result_0.credentialType.length === 64 && result_0.issuedDate.buffer instanceof ArrayBuffer && result_0.issuedDate.BYTES_PER_ELEMENT === 1 && result_0.issuedDate.length === 32 && result_0.attributeKey.buffer instanceof ArrayBuffer && result_0.attributeKey.BYTES_PER_ELEMENT === 1 && result_0.attributeKey.length === 64 && result_0.attributeValue.buffer instanceof ArrayBuffer && result_0.attributeValue.BYTES_PER_ELEMENT === 1 && result_0.attributeValue.length === 256)) {
      __compactRuntime.typeError('getCredentialAttribute',
                                 'return value',
                                 'credential_store.compact line 28 char 1',
                                 'struct CredentialAttribute<credentialId: Bytes<32>, issuer: Bytes<64>, credentialType: Bytes<64>, issuedDate: Bytes<32>, attributeKey: Bytes<64>, attributeValue: Bytes<256>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_6.toValue(result_0),
      alignment: _descriptor_6.alignment()
    });
    return result_0;
  }
  async _evaluatePolicyBoundary_0(context,
                                  partialProofData,
                                  credentialId_0,
                                  attributeKey_0,
                                  policyType_0,
                                  policyParams_0)
  {
    const attribute_0 = this._getCredentialAttribute_0(context,
                                                       partialProofData,
                                                       credentialId_0,
                                                       attributeKey_0);
    const hasAttribute_0 = !this._equal_0(attribute_0.credentialId,
                                          new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    if (hasAttribute_0 === false) {
      return 2;
    } else {
      const isAge_0 = this._equal_1(policyType_0,
                                    new Uint8Array([97, 103, 101, 45, 116, 104, 114, 101, 115, 104, 111, 108, 100, 45, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
      const isKyc_0 = this._equal_2(policyType_0,
                                    new Uint8Array([107, 121, 99, 45, 116, 105, 101, 114, 45, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
      const isJurisdiction_0 = this._equal_3(policyType_0,
                                             new Uint8Array([106, 117, 114, 105, 115, 100, 105, 99, 116, 105, 111, 110, 45, 101, 120, 99, 108, 117, 115, 105, 111, 110, 45, 118, 49, 0, 0, 0, 0, 0, 0, 0]));
      if (isAge_0) {
        return await this._evaluateAgeThreshold_0(context,
                                                  partialProofData,
                                                  attribute_0,
                                                  policyParams_0);
      } else {
        if (isKyc_0) {
          return await this._evaluateKYCTier_0(context,
                                               partialProofData,
                                               attribute_0,
                                               policyParams_0);
        } else {
          if (isJurisdiction_0) {
            return await this._evaluateJurisdictionExclusion_0(context,
                                                               partialProofData,
                                                               attribute_0,
                                                               policyParams_0);
          } else {
            return 2;
          }
        }
      }
    }
  }
  async _evaluateAgeThreshold_0(context, partialProofData, attribute_0, params_0)
  {
    const threshold_0 = this._witnessParseThreshold_0(context,
                                                      partialProofData,
                                                      params_0);
    const age_0 = this._witnessComputeAge_0(context,
                                            partialProofData,
                                            attribute_0.attributeValue);
    if (age_0 > threshold_0) { return 0; } else { return 1; }
  }
  async _evaluateKYCTier_0(context, partialProofData, attribute_0, params_0) {
    const minimumTier_0 = this._witnessParseTier_0(context,
                                                   partialProofData,
                                                   params_0);
    const tier_0 = this._witnessParseTier_0(context,
                                            partialProofData,
                                            attribute_0.attributeValue);
    if (tier_0 >= minimumTier_0) { return 0; } else { return 1; }
  }
  async _evaluateJurisdictionExclusion_0(context,
                                         partialProofData,
                                         attribute_0,
                                         params_0)
  {
    const jurisdiction_0 = attribute_0.attributeValue;
    const isExcluded_0 = this._witnessCheckExclusion_0(context,
                                                       partialProofData,
                                                       jurisdiction_0,
                                                       params_0);
    if (isExcluded_0) { return 1; } else { return 0; }
  }
  _witnessParseThreshold_0(context, partialProofData, params_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.witnessParseThreshold(witnessContext_0,
                                                                                params_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 65535n)) {
      __compactRuntime.typeError('witnessParseThreshold',
                                 'return value',
                                 'credential_store.compact line 110 char 1',
                                 'Uint<0..65536>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _witnessParseTier_0(context, partialProofData, params_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.witnessParseTier(witnessContext_0,
                                                                           params_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 255n)) {
      __compactRuntime.typeError('witnessParseTier',
                                 'return value',
                                 'credential_store.compact line 111 char 1',
                                 'Uint<0..256>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _witnessComputeAge_0(context, partialProofData, dob_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.witnessComputeAge(witnessContext_0,
                                                                            dob_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 65535n)) {
      __compactRuntime.typeError('witnessComputeAge',
                                 'return value',
                                 'credential_store.compact line 112 char 1',
                                 'Uint<0..65536>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_2.toValue(result_0),
      alignment: _descriptor_2.alignment()
    });
    return result_0;
  }
  _witnessCheckExclusion_0(context, partialProofData, jurisdiction_0, excluded_0)
  {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.witnessCheckExclusion(witnessContext_0,
                                                                                jurisdiction_0,
                                                                                excluded_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'boolean')) {
      __compactRuntime.typeError('witnessCheckExclusion',
                                 'return value',
                                 'credential_store.compact line 113 char 1',
                                 'Boolean',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    callContext: { currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({
  getCredentialAttribute: (...args) => undefined,
  witnessParseThreshold: (...args) => undefined,
  witnessParseTier: (...args) => undefined,
  witnessComputeAge: (...args) => undefined,
  witnessCheckExclusion: (...args) => undefined
});
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
export const expectedVk = {};

//# sourceMappingURL=index.js.map
