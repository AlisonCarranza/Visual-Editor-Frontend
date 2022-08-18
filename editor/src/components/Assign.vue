<template>
   <div>
      <h4>Assign</h4>
      <br />
      <span
         ><a>Variable</a></span
      >
      <input class="form-control" type="text" placeholder="Variable"  disabled/>
      <span
         ><a>Value</a></span
      >
      <input class="form-control" type="input" placeholder="Value"  disabled/>
   </div>
</template>

<script>
import { onMounted} from "vue";


export default {
   name: "AssignVue",

   setup() {
      
      /*const internalInstance = getCurrentInstance();
      let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
      const nodeId = editor.value.nodeId;*/

      
      onMounted(() => {
         
      });

      return { };
   }
};
</script>

<style>

</style>