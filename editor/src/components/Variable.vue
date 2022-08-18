<template>
   <div>
      <h4>Variable</h4>
      <br/>
      <input class="form-control" type="text" placeholder="Variable" @change="changeVar"/>
   </div>
</template>

<script>
import { onMounted,getCurrentInstance  } from "vue";


export default {
   name: "VariableVue",

   setup() {
      
      const internalInstance = getCurrentInstance();
      let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
      const nodeId = editor.value.nodeId;

      

      const changeVar = (e) => {
           let dataNode = editor.value.getNodeFromId(nodeId);
           editor.value.updateNodeDataFromId(nodeId, {Variable:e.target.value, Value: dataNode.data.Value});
        }
      
      onMounted(() => {
         
      });

      return { changeVar};
   }
};
</script>

<style>

</style>