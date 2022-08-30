<template>
   <div>
      <h4>Assign</h4>
      <br />
      <span
         ><a>Variable</a></span
      >
      <input class="form-control" type="text" placeholder="Variable"  :value="assign?.Variable" df-variable disabled/>
      <span
         ><a>Value</a></span
      >
      <input class="form-control" type="input" placeholder="Value"    :value="assign?.Value" df-value disabled/>
   </div>
</template>

<script>
import { onMounted, ref ,getCurrentInstance, computed} from "vue";
import {useStore} from "vuex";


export default {
   name: "AssignVue",

   setup() {
      const internalInstance = getCurrentInstance();
      let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
      const nodeId = ref(0);
      nodeId.value=editor.value.nodeId;
      console.log('node id',nodeId.value);

      const store = useStore();

      const assign = computed(() => store.state.Assigns[nodeId.value]);
      
      onMounted(() => {
         console.log(store.state.Assigns);
         
      });

      return { nodeId , assign };

   },
};
</script>

<style>

</style>