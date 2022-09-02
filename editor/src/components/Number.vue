<template>
         <div>
            <h4>Number</h4>
            <h5>Valor : {{newNumber}}</h5>
            <input class="form-control" type="number" @change="updateNewNumber" @keyup="updateNewNumber" placeholder="Numero" df-number required />
          </div>
   
</template>

<script>
import { onMounted, ref, getCurrentInstance, shallowRef} from "vue";
import {useStore} from "vuex";


export default {
   name: "NumberVue",

   setup() {
      const {dispatch} = useStore();

      let newNumber = ref(0);
      const internalInstance = getCurrentInstance();

      let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
      const nodeId = editor.value.nodeId;

      const dataNode = shallowRef({});

      console.log('editor',editor.value.nodeId);

      const updateNewNumber = (e) => {
         dataNode.value = editor.value.getNodeFromId(nodeId);
         newNumber.value = e.target.value;

            if (isNaN(parseInt(e.target.value))) { 
              newNumber.value = 0;
              console.log('nan',newNumber.value);
            }

            editor.value.updateNodeDataFromId(nodeId, {Father:dataNode.value.data.Father,Value: parseInt(newNumber.value)});
            console.log('editor',editor.value.getNodeFromId(nodeId));

            dispatch("setNumberAction", {id: nodeId, value: parseInt(e.target.value)});
         
         
      };
      
      onMounted(() => {
         
      });

      return {newNumber, nodeId, dataNode, updateNewNumber};
   }
};
</script>

<style>

</style>