<template>
   <div>
      <h3>{{title}}</h3>
      
      <input class="form-control" type="number" placeholder="Result" :value="operation?.Result" disabled />
      <span
         ><a>Number 1--- {{ operation?.Number1}}</a></span
      >
      <br />
      <span
         ><a>Number 2--- {{operation?.Number2}}</a></span
      >
   </div> 
   
</template>

<script>
import { onMounted, ref ,getCurrentInstance, computed} from "vue";
import {useStore} from "vuex";


export default {
   name: "BinaryOperations",
   props:{
     title: String,
   },
   setup() {
      const internalInstance = getCurrentInstance();
      let editor = internalInstance.appContext.app._context.config.globalProperties.$editor;
      const nodeId = ref(0);
      nodeId.value=editor.value.nodeId;
      console.log('node id',nodeId.value);

      const store = useStore();

      const operation = computed(() => store.state.Operations[nodeId.value]);
      
      
      onMounted(() => {
         console.log(store.state.Operations);
         
      });

      return { nodeId , operation};

   },
};
</script>

<style>

</style>