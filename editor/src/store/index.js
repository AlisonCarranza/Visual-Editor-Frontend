import {createStore} from "vuex";

const store = createStore({
    state:{
        Numbers:{},
        Operations: {},
        Variables:{},
        Assigns:{}

    },
    getters:{
        getNumbers: (state) => state.Numbers,
        getNumberbyId: (state) => (id) => state.Numbers[id],
        getOperations: (state) => state.Operations,
        getVariables: (state) => state.Variables,
        getAssigns: (state) => state.Assigns,
    },
    mutations:{
        addNumber(state, number) {
            state.Numbers[number.id] = number.value;
         },
         deleteNumber(state, number) {
            delete state.Numbers[number.id];
         },
         addOperation(state, operation) {
            state.Operations[operation.id] = operation.value;
         },
         deleteOperation(state, operation) {
            delete state.Operations[operation.id];
         },
         addAssign(state, assign) {
            state.Assigns[assign.id] = assign.value;
         },
         deleteAssign(state, assign) {
            delete state.Assigns[assign.id];
         },
         addVariable(state, variable) {
            state.Variables[variable.id] = variable.value;
         },
         deleteVariable(state, variable) {
            delete state.Variables[variable.id];
         },

    },
    actions:{
        setNumberAction({commit}, number) {
            commit("addNumber", number);
         },
         deleteNumberAction({commit}, number) {
            commit("deleteNumber", number);
         },
         setOperationAction({commit}, operation) {
            commit("addOperation", operation);
         },
         deleteOperationAction({commit}, operation) {
            commit("deleteOperation", operation);
         },
         setAssignAction({commit}, assign) {
            commit("addAssign", assign);
         },
         deleteAssignAction({commit}, assign) {
            commit("deleteAssign", assign);
         },
         setVariableAction({commit}, variable) {
            commit("addVariable", variable);
         },
         deleteVariableAction({commit}, variable) {
            commit("deleteVariable", variable);
         }

    }

});

export default store;