import {createStore} from "vuex";

const store = createStore({
    state:{
        Numbers:{},
        Operations: {},

    },
    getters:{
        getNumbers: (state) => state.Numbers,
        getNumberbyId: (state) => (id) => state.Numbers[id],
        getOperations: (state) => state.Operations,
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
         }

    }

});

export default store;