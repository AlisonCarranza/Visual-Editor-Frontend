<template>
   <div>
      <h4>Variable</h4>
      <br/>
      <input class="form-control" type="text" placeholder="Variable" @change="changeVar" @keyup="changeVar" df-variable/>
   </div>
</template>

<script>
import { onMounted,getCurrentInstance  } from "vue";
import {useStore} from "vuex";


export default {
   name: "VariableVue",

   setup() {
      const {dispatch} = useStore();

      const internalInstance = getCurrentInstance();
      let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
      const nodeId = editor.value.nodeId;

      

      const changeVar = (e) => {
           let dataNode = editor.value.getNodeFromId(nodeId);
           editor.value.updateNodeDataFromId(nodeId, {Father:dataNode.data.Father,Variable:e.target.value, Value: dataNode.data.Value});
           console.log('variable',editor.value.getNodeFromId(nodeId));

           dispatch("setVariableAction", {id: nodeId, value: e.target.value});
        }
      
      onMounted(() => {
         
      });

      return { changeVar};
   }
};
</script>

<style>

</style>