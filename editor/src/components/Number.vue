<template>
         <div>
            <h4>Number</h4>
            <h5>Valor : {{newNumber}}</h5>
            <input class="form-control" type="number" @change="updateNewNumber" placeholder="Numero" df-number required />
          </div>
   
</template>

<script>
import { onMounted, ref, getCurrentInstance} from "vue";


export default {
   name: "NumberVue",

   setup() {
      let newNumber = ref(0);
      const internalInstance = getCurrentInstance();

      let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
      const nodeId = editor.value.nodeId;

      console.log('editor',editor.value.nodeId);

      const updateNewNumber = (e) => {
         newNumber.value = e.target.value;
         editor.value.updateNodeDataFromId(nodeId, {Num: parseInt(newNumber.value)});
         console.log('editor',editor.value.getNodeFromId(nodeId));
      };
      
      onMounted(() => {
         
      });

      return {newNumber, nodeId, updateNewNumber};
   }
};
</script>

<style>

</style>